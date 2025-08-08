FROM node AS build
WORKDIR /app
COPY . .
#RUN npm install
RUN npm install && npm run build

EXPOSE 5173

# CMD ["npm", "run", "dev", "--", "--host"]

# FROM nginx:alpine
# COPY --from=build /app/dist /usr/share/nginx/html
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]


# 2단계: Ninx에서 빌드 결과 서빙
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]