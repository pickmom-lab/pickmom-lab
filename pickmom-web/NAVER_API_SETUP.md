# NAVER API HUB 연결 설정

PICKMOM LAB의 키워드 발굴 기능은 NAVER API HUB의 아래 API를 서버에서 호출합니다.

- 블로그 검색 결과 조회: `GET /search/v1/blog`
- 검색어 트렌드 조회: `POST /search-trend/v1/search`

## 1. NAVER API HUB 권한 확인

네이버 클라우드 플랫폼 콘솔에서 NAVER API HUB > Application으로 이동해 사용 중인 애플리케이션의 API 관리 항목을 확인합니다.

다음 API가 애플리케이션에 선택되어 있어야 합니다.

- 검색 > 블로그 검색 결과 조회
- 검색어 트렌드 > 검색어 트렌드 조회

권한을 추가하거나 변경했다면 저장 후 인증 정보를 확인합니다.

## 2. Vercel 환경 변수 등록

Vercel에서 PICKMOM LAB 프로젝트를 선택한 뒤 Settings > Environment Variables로 이동해 다음 두 항목을 등록합니다.

| Key | Value |
| --- | --- |
| `NCP_NAVER_API_KEY_ID` | NAVER API HUB의 Client ID |
| `NCP_NAVER_API_KEY` | NAVER API HUB의 Client Secret |

Production, Preview 환경 모두에서 사용할 계획이라면 해당 환경을 선택합니다. 값을 입력한 뒤 저장하고, 변경 사항이 적용되도록 새 배포를 실행합니다.

중요: 두 값은 브라우저 코드나 공개 저장소에 입력하지 마세요. 서버 환경 변수로만 사용합니다. 채팅에 Client Secret을 붙여 넣을 필요도 없습니다.

## 3. 연결 테스트

배포 후 PICKMOM LAB > 키워드 발굴에서 분야를 선택하고 '선택 분야 키워드 트렌드 조회'를 실행합니다. 이후 키워드를 직접 입력해 블로그 검색 결과도 확인합니다.

인증 오류가 발생하면 API 권한과 환경 변수의 오타를 확인합니다. 401은 인증 정보 또는 API 권한 문제일 수 있고, 429는 일일 호출 한도 초과일 수 있습니다.

## 데이터 해석상 제한

- 검색어 트렌드의 ratio는 조회 기간 내 최대값을 100으로 환산한 상대 지수입니다. 월간 검색량의 절대값이 아닙니다.
- 블로그 검색의 total은 해당 API가 반환하는 검색 결과 전체 건수입니다. 네이버 광고 키워드 도구의 월간 검색량이나 정확한 경쟁 문서 수와 같은 지표가 아닙니다.
- 블로그 검색 API는 제목, 링크, 요약, 블로그명, 작성일을 제공합니다. 글의 전체 본문과 사진 배치 정보는 제공하지 않습니다.
- 후보 키워드는 초기 탐색용으로 PICKMOM LAB에 등록한 주제 목록입니다. NAVER API HUB 검색어 트렌드는 입력된 키워드의 추이를 조회하는 API이지, 아무 입력 없이 신규 급상승 키워드를 자동 발굴하는 API는 아닙니다.

## 공식 문서

- [NAVER API HUB 개요 및 인증](https://api.ncloud-docs.com/docs/naver-api-hub-overview)
- [블로그 검색 결과 조회](https://api.ncloud-docs.com/docs/naver-api-hub-search-blog)
- [검색어 트렌드 조회](https://api.ncloud-docs.com/docs/naver-api-hub-search-trend)
