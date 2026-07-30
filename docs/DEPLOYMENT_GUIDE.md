# NestSphere ERP Production Deployment Guide

## 1. Architecture Overview
NestSphere ERP is built as a high-availability, multi-tenant enterprise system using NestJS, Prisma ORM, PostgreSQL, Redis, React (Vite), Docker, and Kubernetes.

```
                  [ Ingress / SSL / Nginx ]
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
   [ Frontend Pods (Nginx) ]       [ Backend Pods (NestJS) ]
                                              │
                              ┌───────────────┴───────────────┐
                              ▼                               ▼
                     [ PostgreSQL Database ]          [ Redis Cache ]
```

## 2. Prerequisites
- Docker v24.0+ & Docker Compose v2.20+
- Kubernetes cluster (v1.26+) with `cert-manager` & `ingress-nginx`
- PostgreSQL 15+ & Redis 7+

## 3. Docker Compose Local Staging
```bash
docker-compose up -d --build
```

## 4. Production Kubernetes Deployment
1. Apply ConfigMaps & Secrets:
   ```bash
   kubectl apply -f k8s/configmap.yaml
   ```
2. Deploy Backend & Frontend Pods:
   ```bash
   kubectl apply -f k8s/deployment.yaml
   kubectl apply -f k8s/service.yaml
   ```
3. Enable Autoscaling & Ingress Routing:
   ```bash
   kubectl apply -f k8s/hpa.yaml
   kubectl apply -f k8s/ingress.yaml
   ```
