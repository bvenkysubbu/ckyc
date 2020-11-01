# ckyc
Know Your Client Application Form

# To Run Locally

docker rm -f ckyc
docker build -t bvenkysubbu/ckyc .
docker run --name ckyc -p 49160:8080 -d bvenkysubbu/ckyc
docker logs --follow ckyc

Open http://localhost:49160/