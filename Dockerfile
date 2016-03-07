FROM node:0.12.10

# Avoid ERROR: invoke-rc.d: policy-rc.d denied execution of start. 
#RUN echo "#!/bin/sh\nexit 0" > /usr/sbin/policy-rc.d

RUN mkdir -p /app/node_modules

WORKDIR /app

COPY . /app/

ENV DOCKER docker
ENV UV_THREADPOOL_SIZE 100
EXPOSE 3006

# Build and run tests, exit 1 if it fails
#RUN ["/bin/sh", "./container-debug.sh"]
