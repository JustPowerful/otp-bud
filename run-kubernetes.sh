kubectl apply -f k8s/namespace.yaml
kubectl -n otp-bud create secret generic otpbud-env --from-env-file=.env.k8s
kubectl apply -f k8s/postgres.yaml -f k8s/redis.yaml
kubectl apply -f k8s/app.yaml

kubectl apply -f k8s/ingress.yaml
kubectl -n otp-bud get ingress