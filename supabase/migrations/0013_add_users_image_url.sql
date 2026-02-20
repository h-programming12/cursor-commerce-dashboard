-- public.users 테이블에 image_url 컬럼 추가
ALTER TABLE public.users 
ADD COLUMN image_url TEXT;

-- 컬럼 설명 추가
COMMENT ON COLUMN public.users.image_url IS '프로필 이미지 URL 또는 data URL 저장';
