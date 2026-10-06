# Déploiement sur le VPS (derrière Traefik)

Ce guide explique comment mettre en ligne **NextSeed Manga** sur le VPS existant, à côté des autres
applications, sans rien casser.

Principe : le site tourne dans **un seul conteneur Docker** (`nextseed-manga`) qui **ne publie aucun
port** sur l'hôte. Il rejoint le réseau Docker de Traefik, et Traefik (qui possède déjà les ports 80
et 443) le route grâce à des **labels**. Exactement comme les autres apps Next.js du serveur.

```
Internet ──443──▶ Traefik (conteneur existant) ──réseau Docker──▶ nextseed-manga:3000
```

Fichiers concernés dans le dépôt :

| Fichier              | Rôle                                                                 |
| -------------------- | -------------------------------------------------------------------- |
| `Dockerfile`         | Image multi-étapes Node 22, utilisateur non-root, serveur standalone |
| `docker-compose.yml` | Service `nextseed-manga`, réseau externe Traefik, labels Traefik v2  |
| `.env.example`       | Modèle des variables à copier en `.env` sur le serveur               |
| `/api/health`        | Route de santé utilisée par le `HEALTHCHECK` Docker                  |

> Le contenu et les illustrations sont **dans le dépôt** et sont intégrés à l'image au build.
> Publier une nouvelle création = la merger sur `main`, puis `git pull` + rebuild (voir
> « Mettre à jour »). Il n'y a ni base de données ni volume à gérer.

---

## 1. Prérequis

- Accès SSH au VPS avec un utilisateur qui peut lancer `docker`.
- Docker et Docker Compose v2+ (`docker compose version`).
- Traefik v2 déjà en service (conteneur généralement nommé `traefik`).
- `git` installé.

## 2. Récupérer les infos Traefik

Trois valeurs sont nécessaires pour remplir `.env` : le **réseau**, l'**entrypoint HTTPS** et le
**certresolver**. Elles se lisent sur le serveur, sans rien modifier.

### Nom du conteneur Traefik

```bash
docker ps --filter "ancestor=traefik" --format '{{.Names}}  {{.Image}}'
# ou plus large :
docker ps --format '{{.Names}}  {{.Image}}' | grep -i traefik
```

Dans la suite, remplace `traefik` par le nom trouvé s'il est différent.

### Réseau Docker (`TRAEFIK_NETWORK`)

```bash
docker network ls
docker inspect traefik --format '{{range $name, $_ := .NetworkSettings.Networks}}{{$name}}{{"\n"}}{{end}}'
```

Prends le réseau partagé avec les autres apps (pas `bridge`). Pour confirmer, vérifie qu'une app
existante est bien dessus :

```bash
docker network inspect <nom-du-reseau> --format '{{range .Containers}}{{.Name}} {{end}}'
```

### Entrypoint et certresolver (`TRAEFIK_ENTRYPOINT`, `TRAEFIK_CERTRESOLVER`)

Le plus simple : copier ce qu'utilise déjà une autre app routée par Traefik.

```bash
docker inspect <une-app-existante> --format '{{json .Config.Labels}}' | tr ',' '\n' | grep traefik
```

Repère les lignes `...entrypoints=` (souvent `websecure`) et `...tls.certresolver=` (souvent
`letsencrypt`, `le`, `myresolver`...).

Sinon, dans la configuration de Traefik lui-même :

```bash
docker inspect traefik --format '{{json .Args}}' | tr ',' '\n'
# chercher --entrypoints.<NOM>.address=:443 et --certificatesresolvers.<NOM>.acme...
```

Si Traefik est configuré par fichier (`traefik.yml`/`traefik.toml`), regarde les sections
`entryPoints` et `certificatesResolvers` du fichier monté (`docker inspect traefik --format
'{{json .Mounts}}'` indique où il se trouve).

## 3. DNS

Chez le registrar / gestionnaire DNS du domaine, crée un enregistrement :

| Type | Nom                         | Valeur            |
| ---- | --------------------------- | ----------------- |
| A    | sous-domaine choisi (ex. `manga`) | IPv4 publique du VPS |

(Ajoute un `AAAA` seulement si le VPS a une IPv6 que Traefik écoute.)

Vérifie la propagation avant le premier démarrage, sinon Let's Encrypt échouera à émettre le
certificat :

```bash
dig +short <ton-domaine>
```

## 4. Premier déploiement

```bash
# Où ranger l'app : à adapter à l'organisation du serveur
cd /opt   # ou ~/apps
git clone https://github.com/ddtc92contact-nextseed-ai/nextseed-manga.git
cd nextseed-manga

cp .env.example .env
nano .env   # remplir SITE_DOMAIN, TRAEFIK_NETWORK, TRAEFIK_ENTRYPOINT, TRAEFIK_CERTRESOLVER
```

Contrôler la configuration (aucune erreur, labels avec les bonnes valeurs, pas de `ports:`) :

```bash
docker compose config
```

Construire et démarrer, en taguant l'image avec le commit pour pouvoir revenir en arrière :

```bash
export IMAGE_TAG=$(git rev-parse --short HEAD)
docker compose build
docker compose up -d
```

> `IMAGE_TAG` exporté dans le shell est prioritaire sur la valeur de `.env`. Sans export, l'image
> est taguée `latest`.

Vérifier :

```bash
docker compose ps          # STATUS doit passer à "healthy" (~20 s)
docker compose logs -f     # Ctrl+C pour quitter
curl -I https://<ton-domaine>
curl https://<ton-domaine>/api/health   # {"status":"ok"}
```

Traefik ignore un conteneur tant que son healthcheck n'est pas « healthy » : un 404 Traefik
pendant les premières secondes est normal.

## 5. Mettre à jour (nouvelle création, correctif...)

```bash
cd /opt/nextseed-manga
git pull
export IMAGE_TAG=$(git rev-parse --short HEAD)
docker compose build
docker compose up -d
```

Le build se fait pendant que l'ancienne version reste en ligne ; seul le remplacement du conteneur
provoque une coupure de quelques secondes.

Note le tag en service avant chaque mise à jour (utile pour le rollback) :

```bash
docker inspect nextseed-manga --format '{{.Config.Image}}'
docker images nextseed-manga     # liste des versions disponibles localement
```

## 6. Revenir à la version précédente (rollback)

Les anciennes images restent sur le serveur tant qu'elles ne sont pas supprimées.

```bash
cd /opt/nextseed-manga
docker images nextseed-manga                 # repérer le tag précédent, ex. a1b2c3d
IMAGE_TAG=a1b2c3d docker compose up -d --no-build
```

Pour rendre le rollback durable (éviter qu'un `up` sans variable ne relance `latest`), mets aussi
`IMAGE_TAG=a1b2c3d` dans `.env`, ou repositionne le code : `git checkout a1b2c3d`.

Ménage occasionnel des vieilles images (garde au moins les 2 dernières) :

```bash
docker rmi nextseed-manga:<vieux-tag>
docker image prune      # supprime seulement les images orphelines (<none>)
```

## 7. Logs

```bash
docker compose logs -f --tail=100      # logs de l'app
docker logs traefik --since 10m 2>&1 | grep -i nextseed   # erreurs de routage / certificat
```

Les logs du conteneur sont limités à 3 fichiers de 10 Mo (rotation automatique).

## 8. Vérifier qu'on ne dérange pas les autres conteneurs

- **Aucun port publié** : `docker compose config` ne doit contenir aucune clé `ports:` et
  `docker port nextseed-manga` ne doit rien afficher.
- **Noms uniques** : conteneur, router, service et middlewares Traefik sont tous préfixés
  `nextseed-manga`. Vérifier qu'aucune autre app n'utilise ce nom :
  ```bash
  docker ps -a --format '{{.Names}}' | grep nextseed
  ```
- **Autres sites toujours OK** :
  ```bash
  docker ps --format 'table {{.Names}}\t{{.Status}}'   # tous "Up", aucun redémarrage récent
  curl -I https://<domaine-d-une-autre-app>
  ```
- **Ressources** : mémoire plafonnée à 768 Mo (`mem_limit` dans `docker-compose.yml`) :
  ```bash
  docker stats --no-stream nextseed-manga
  ```
- **Traefik** : pas d'erreur nouvelle dans `docker logs traefik --since 10m`.

## 9. Redirection HTTP → HTTPS

Deux cas :

1. **Traefik redirige déjà tout le trafic HTTP** (cas le plus courant). Vérifier :
   ```bash
   docker inspect traefik --format '{{json .Args}}' | tr ',' '\n' | grep -i redirect
   # ex. --entrypoints.web.http.redirections.entrypoint.to=websecure
   curl -I http://<ton-domaine>      # doit répondre 301/308 vers https://
   ```
   → **Rien à faire**, laisser les labels de redirection commentés.

2. **Pas de redirection globale** (`curl -I http://<ton-domaine>` répond 404) :
   décommenter les 5 lignes « Optional http -> https redirect » dans `docker-compose.yml`, ajuster
   `TRAEFIK_HTTP_ENTRYPOINT` dans `.env` si l'entrypoint HTTP ne s'appelle pas `web`, puis
   `docker compose up -d`.

## 10. Dépannage rapide

| Symptôme                          | Piste                                                                                   |
| --------------------------------- | --------------------------------------------------------------------------------------- |
| `network ... declared as external, but could not be found` | `TRAEFIK_NETWORK` incorrect → `docker network ls`             |
| 404 Traefik persistant            | Conteneur pas `healthy` (`docker compose ps`), ou mauvais `SITE_DOMAIN` / entrypoint     |
| Erreur de certificat              | DNS pas encore propagé ou mauvais `TRAEFIK_CERTRESOLVER` → `docker logs traefik`         |
| 502 Bad Gateway                   | Label `traefik.docker.network` ≠ réseau réel, ou l'app a planté (`docker compose logs`)  |
| Build qui échoue sur les polices  | Le build télécharge Google Fonts : le serveur doit avoir un accès Internet sortant        |

## Tester l'image en local (optionnel)

```bash
docker build -t nextseed-manga:local .
docker run --rm -e PORT=3000 -p 3000:3000 nextseed-manga:local
# http://localhost:3000 et http://localhost:3000/api/health
```
