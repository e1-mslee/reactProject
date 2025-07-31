FROM node AS build
WORKDIR /app
COPY . .
RUN npm install
# RUN npm install && npm run build

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]

# FROM nginx:alpine
# COPY --from=build /app/dist /usr/share/nginx/html
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]