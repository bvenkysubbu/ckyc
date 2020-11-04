# ckyc
Know Your Client Application Form - https://ckyc.drusmtic.com/

# To Run Locally
```
docker rm -f ckyc
docker build -t bvenkysubbu/ckyc .
docker run --name ckyc -p 49160:8080 -d bvenkysubbu/ckyc
docker logs --follow ckyc
```
Open http://localhost:49160/

# Push To Container Registry
```
docker rm -f ckyc
docker build -t bvenkysubbu/ckyc .
docker tag bvenkysubbu/ckyc registry.gitlab.com/bvenkysubbu/ckyc
docker push registry.gitlab.com/bvenkysubbu/ckyc
```

# Run the container
```
docker pull registry.gitlab.com/bvenkysubbu/ckyc && docker rm -f ckyc; docker run -d --net drumstic_network --restart unless-stopped -v /root/tymly_play/.ssh:/root/.ssh -P --publish 8380:8080 --publish 6222:22 --name ckyc registry.gitlab.com/bvenkysubbu/ckyc
```