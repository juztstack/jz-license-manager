# Deploy to Coolify

## Setup

1. **Push to GitHub** (o tu repositorio preferido):
   ```bash
   cd /home/jesusuzcategui/WorkspaceNode/jz-license-manager
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/TU_USER/jz-license-manager.git
   git branch -M main
   git push -u origin main
   ```

2. **En Coolify Dashboard**:
   - Click **Add New Resource**
   - Select **Git Repository**
   - Paste: `https://github.com/TU_USER/jz-license-manager`
   - Branch: `main`

3. **Configure**:
   - **Build Pack**: `Dockerfile`
   - **Port**: `80`
   - **Health Check**: `http://localhost:`

4. **Deploy** - Click el botón de deploy

5. **Coolify te dará un dominio temporal** como:
   ```
   https://app-xxxxx.coolify.io
   ```

## Después del Deploy

El dominio temporal de Coolify ya funcionará. 

Si quieres usar un dominio propio:
1. Ve a tu proveedor de DNS
2. Crea un CNAME apuntando a `app-xxxxx.coolify.io`

## Verificar Deployment

1. Abre el dominio de Coolify
2. Login con: `admin@example.com` / `admin`
3. Crea una license de prueba
4. Verifica en DevTools que no hay errores

## Troubleshooting

| Problema | Solución |
|----------|----------|
| Build falla | Verifica Dockerfile syntax |
| Assets no cargan | Revisa nginx config en Docker |
| Login no funciona | Cookies pueden estar bloqueadas |

## Actualizar SEO URLs (opcional)

Después de tener tu dominio, edita `index.html`:
```html
<link rel="canonical" href="https://tu-dominio.com/" />
```
