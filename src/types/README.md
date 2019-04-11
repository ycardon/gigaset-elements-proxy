Gigaset types definitions are obtained with [json-ts](https://github.com/shakyShane/json-ts)
- `curl 'http://localhost:3000/api/v1/me/basestations' | json-ts --stdin --namespace gigasetBasestations > gigaset-basestations.d.ts`
- `curl 'http://localhost:3000/api/v2/me/events?limit=10000' | json-ts --stdin --namespace gigasetEvents > gigaset-events.d.ts`
