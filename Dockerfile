# Backend image: Node runs the API, Python runs the sentiment model.
# Both are needed in one image because pythonService.js spawns helper.py
# as a subprocess on every review.
#
# Build context is the repo root so BACKEND/ and python/ are both available.

FROM node:22-slim

# python3-pip pulls in python3; ca-certificates is needed for Atlas TLS.
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      python3 \
      python3-pip \
      ca-certificates \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Python deps first - they change least often, so this layer stays cached.
# --break-system-packages is required on Debian 12+, which marks the system
# Python as externally managed.
COPY python/requirements.txt ./python/requirements.txt
RUN pip3 install --break-system-packages --no-cache-dir \
      -r python/requirements.txt

# Node deps next, before app code, for the same caching reason.
COPY BACKEND/package.json BACKEND/package-lock.json ./BACKEND/
RUN cd BACKEND && npm ci --omit=dev

# Application code.
COPY BACKEND/ ./BACKEND/
COPY python/ ./python/

# helper.py shells out as `python3`; PY_HELPER_ABS_PATH stays unset so
# pythonService.js resolves the helper relative to its own module instead.
ENV PYTHON_BIN=python3
ENV NODE_ENV=production

# Render overrides this via $PORT; server.js already reads it.
EXPOSE 8070

CMD ["node", "BACKEND/server.js"]
