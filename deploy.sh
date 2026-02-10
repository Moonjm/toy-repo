#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ ! -f "${SCRIPT_DIR}/.deploy.env" ]; then
  echo ".deploy.env 파일이 없습니다." >&2
  exit 1
fi

source "${SCRIPT_DIR}/.deploy.env"

APP_NAME="$1"

if [ -z "$APP_NAME" ]; then
  echo "사용법: ./deploy.sh <앱이름>"
  echo "예:     ./deploy.sh daily-record"
  echo "        → ${REMOTE_BASE_DIR}/daily-record/front 에 배포"
  echo ""
  echo "배포 가능한 앱:"
  for dir in "${SCRIPT_DIR}/apps"/*/; do
    [ -d "$dir" ] && echo "  - $(basename "$dir")"
  done
  exit 1
fi

APP_DIR="${SCRIPT_DIR}/apps/${APP_NAME}"

if [ ! -d "$APP_DIR" ]; then
  echo "앱 디렉토리를 찾을 수 없습니다: apps/${APP_NAME}" >&2
  exit 1
fi

REMOTE_WEB_DIR="${REMOTE_BASE_DIR}/${APP_NAME}/front"
ARCHIVE="${APP_NAME}.tar.gz"

echo "=== 1. ${APP_NAME} 빌드 ==="
pnpm --filter "${APP_NAME}" build

echo "=== 2. dist 압축 ==="
tar --no-xattrs -czf "${ARCHIVE}" -C "${APP_DIR}/dist" .

echo "=== 3. 라즈베리파이로 전송 ==="
scp "${ARCHIVE}" "${REMOTE_USER}@${REMOTE_HOST}:/tmp/${ARCHIVE}"

echo "=== 4. 로컬 압축파일 정리 ==="
rm -f "${ARCHIVE}"

echo "=== 5. 원격 배포 (${REMOTE_WEB_DIR}) ==="
ssh "${REMOTE_USER}@${REMOTE_HOST}" "\
  rm -rf ${REMOTE_WEB_DIR}/* && \
  tar -xzf /tmp/${ARCHIVE} -C ${REMOTE_WEB_DIR} && \
  rm -f /tmp/${ARCHIVE}"

echo "=== ${APP_NAME} → ${REMOTE_WEB_DIR} 배포 완료 ==="
