git pull && docker build --no-cache -t react-ui . && docker run --rm -ti -p 5010:5000 react-ui
