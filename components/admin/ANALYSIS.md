# Admin 컴포넌트 분석 결과

## 1. Figma 디자인에 있는 컴포넌트 목록

### 1.1 사이드바 (Menu/Sidebar)
- **Logo**: "Cursor Commerce" 텍스트 + 아이콘 (indent-decrease)
- **Section**: 섹션 제목 (MAIN MENU, PRODUCTS, ADMIN)
- **MenuItem**: 메뉴 아이템 리스트
  - 아이콘 (22x22)
  - 텍스트 (15px, Public Sans)
  - Badge (선택적, 22x22, 보라색 배경)
  - Chevron 아이콘 (18x18, right/down)
- **상태**: active (#f3f4f8 배경), inactive (투명 배경)

### 1.2 검색 입력 (Search Form)
- **SearchInput**: 검색 아이콘 포함 입력 필드
  - Placeholder: "Search by order id"
  - 배경: #ffffff
  - 텍스트: #8b909a (placeholder), 15px Public Sans Regular
  - 아이콘: 검색 아이콘 (18x18)

### 1.3 테이블 (Table)
- **TableHeader**: 테이블 헤더 행
  - 배경: #ffffff
  - 테두리: #e9e7fd (외곽), #dbdade (셀 구분)
  - 텍스트: #8b909a, 13px Public Sans Medium
  - 높이: 47px
- **TableRow**: 테이블 데이터 행
  - 배경: #ffffff
  - 테두리: #e9e7fd (외곽), #dbdade (셀 구분)
  - 텍스트: #23272e, 15px Public Sans Regular
  - 높이: 50px
- **TableCell**: 테이블 셀
  - 패딩: 좌우 16px
  - 정렬: 좌측 정렬

### 1.4 페이지네이션 (Pagination)
- **PaginationContainer**: 페이지네이션 컨테이너
  - "Showing" 텍스트 + 드롭다운 + "of X" 텍스트
  - 페이지 번호 버튼들
  - 이전/다음 버튼
- **PageSizeDropdown**: 페이지 크기 선택 드롭다운
  - 배경: #ffffff
  - 테두리: #e9e7fd
  - 텍스트: #23272e, 15px Public Sans Medium
  - 높이: 38px
- **PageButton**: 페이지 번호 버튼
  - 활성: #141718 배경, #ffffff 텍스트
  - 비활성: #f1f2f6 배경, #8b909a 텍스트
  - 크기: 28x28px
  - 텍스트: 13px Public Sans Regular

### 1.5 드롭다운 (Dropdown)
- **FilterDropdown**: 필터 드롭다운
  - 배경: #ffffff
  - Placeholder: "Filter by date range"
  - 텍스트: #8b909a, 15px Public Sans Medium
  - 높이: 40px
  - 테두리: #e9e7fd (선택적)
  - 아이콘: chevron-down (16x16)

### 1.6 토글 스위치 (Toggle Switch)
- **Toggle**: 토글 스위치
  - 크기: 44x24px
  - 활성 상태: #1f2937 배경, #ffffff 원형 버튼 (20x20)
  - 비활성 상태: #e5e7eb 배경, #ffffff 원형 버튼 (20x20)
  - Border radius: 9999px (완전한 둥근 모서리)

### 1.7 설정 카드 (Settings Card)
- **SettingsCard**: 설정 카드 컨테이너
  - 배경: #ffffff
  - 테두리: #e5e7eb
  - Border radius: 12px
  - 패딩: 25px
- **CardHeader**: 카드 헤더
  - 아이콘 배경: #eff6ff (40x40px, 8px radius)
  - 아이콘: 알림 아이콘 (#2563eb)
  - 제목: 16px Poppins SemiBold (#111827)
  - 설명: 14px Poppins Medium (#6b7280)
- **CardContent**: 카드 내용
  - 라벨: 14px Inter Regular (#374151)
  - 입력 필드: #f3f4f6 배경, 8px radius, 44px 높이
  - 입력 텍스트: 14px Inter Medium (#1f2937)
  - 도움말 텍스트: 12px Inter Thin (#6b7280)

### 1.8 입력 필드 (Input)
- **Input**: 기본 입력 필드
  - 배경: #f3f4f6
  - Border radius: 8px
  - 높이: 44px
  - 텍스트: 14px Inter Medium (#1f2937)
  - 패딩: 좌우 12px

## 2. 기존 컴포넌트와 비교

### 2.1 기존 컴포넌트 (현재 프로젝트)
- `AdminTable`: 제네릭 테이블 ✅
- `AdminFilterBar`: 필터 바 ✅
- `AdminMetricCard`: 지표 카드 ✅
- `AdminStatusBadge`: 상태 배지 ✅
- `AdminLayout`: 레이아웃 ✅
- `AdminHeader`: 헤더 ✅
- `AdminSidebar`: 사이드바 ✅
- `AdminTablePagination`: 페이지네이션 ✅
- `AdminTopbar`: 상단 바 ✅

### 2.2 새로 필요한 컴포넌트 (신규)
1. **AdminSearchInput**: 검색 입력 필드 (아이콘 포함)
2. **AdminDropdown**: 필터 드롭다운
3. **AdminToggle**: 토글 스위치
4. **AdminSettingsCard**: 설정 카드
5. **AdminMenuItem**: 사이드바 메뉴 아이템
6. **AdminTableHeader**: 테이블 헤더 (확장 가능)
7. **AdminTableRow**: 테이블 행 (확장 가능)
8. **AdminTableCell**: 테이블 셀 (확장 가능)
9. **AdminPageSizeSelector**: 페이지 크기 선택 드롭다운

### 2.3 확장이 필요한 기존 컴포넌트 (확장)
1. **AdminSidebar**: 
   - Logo 섹션 추가
   - Section 제목 스타일 추가
   - MenuItem 컴포넌트 통합
   - Badge 표시 기능 추가
   - Chevron 아이콘 (right/down) 지원

2. **AdminTable**:
   - TableHeader 스타일 개선 (#e9e7fd 테두리)
   - TableRow 높이 조정 (50px)
   - TableCell 구분선 스타일 (#dbdade)

3. **AdminTablePagination**:
   - "Showing X of Y" 텍스트 추가
   - PageSizeSelector 통합
   - 페이지 버튼 스타일 개선 (#141718 활성, #f1f2f6 비활성)

4. **AdminFilterBar**:
   - Dropdown 필터 추가
   - SearchInput 통합

## 3. 각 컴포넌트의 Props 인터페이스 설계

### 3.1 AdminSearchInput (신규)
```typescript
interface AdminSearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}
```

### 3.2 AdminDropdown (신규)
```typescript
interface AdminDropdownProps {
  placeholder?: string;
  value?: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}
```

### 3.3 AdminToggle (신규)
```typescript
interface AdminToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}
```

### 3.4 AdminSettingsCard (신규)
```typescript
interface AdminSettingsCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  iconBgColor?: string;
  children: React.ReactNode;
  className?: string;
}
```

### 3.5 AdminMenuItem (신규)
```typescript
interface AdminMenuItemProps {
  icon?: React.ReactNode;
  label: string;
  href?: string;
  active?: boolean;
  badge?: number | string;
  hasSubmenu?: boolean;
  onClick?: () => void;
  className?: string;
}
```

### 3.6 AdminPageSizeSelector (신규)
```typescript
interface AdminPageSizeSelectorProps {
  value: number;
  options: number[];
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}
```

### 3.7 AdminSidebar (확장)
```typescript
interface AdminSidebarProps {
  logo?: React.ReactNode;
  menuItems: Array<{
    section?: string;
    items: AdminMenuItemProps[];
  }>;
  className?: string;
}
```

### 3.8 AdminTable (확장)
```typescript
interface AdminTableProps<T> {
  columns: Array<{
    key: string;
    label: string;
    width?: string | number;
  }>;
  data: T[];
  renderCell?: (column: string, row: T) => React.ReactNode;
  className?: string;
}
```

### 3.9 AdminTablePagination (확장)
```typescript
interface AdminTablePaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  className?: string;
}
```

## 4. 사용되는 디자인 토큰 (--admin-* prefix)

### 4.1 색상 (Colors)

#### 배경 색상
- `--admin-background-default: #ffffff`
- `--admin-background-light: #f3f4f8`
- `--admin-background-gray-light: #f1f2f6`
- `--admin-background-input: #f3f4f6`
- `--admin-background-icon: #eff6ff`
- `--admin-background-toggle-on: #1f2937`
- `--admin-background-toggle-off: #e5e7eb`
- `--admin-background-page-active: #141718`
- `--admin-background-page-inactive: #f1f2f6`

#### 텍스트 색상
- `--admin-text-primary: #23272e`
- `--admin-text-secondary: #8b909a`
- `--admin-text-tertiary: #141718`
- `--admin-text-placeholder: #8b909a`
- `--admin-text-inverse: #ffffff`
- `--admin-text-label: #374151`
- `--admin-text-help: #6b7280`
- `--admin-text-heading: #111827`

#### 테두리 색상
- `--admin-border-table-outer: #e9e7fd`
- `--admin-border-table-cell: #dbdade`
- `--admin-border-card: #e5e7eb`
- `--admin-border-dropdown: #e9e7fd`
- `--admin-border-input: transparent` (기본)

#### 상태 색상
- `--admin-status-active: #28c76f`
- `--admin-status-badge: #7367f0` (16% opacity 배경)
- `--admin-status-icon: #2563eb`

### 4.2 타이포그래피 (Typography)

#### 폰트 패밀리
- `--admin-font-poppins: "Poppins", sans-serif`
- `--admin-font-inter: "Inter", sans-serif`
- `--admin-font-public-sans: "Public Sans", sans-serif`

#### 폰트 크기
- `--admin-text-xs: 11px` (Section 제목)
- `--admin-text-sm: 12px` (도움말 텍스트)
- `--admin-text-base: 13px` (테이블 헤더)
- `--admin-text-md: 14px` (입력 필드, 라벨)
- `--admin-text-lg: 15px` (메뉴, 검색, 드롭다운)
- `--admin-text-xl: 16px` (카드 제목)
- `--admin-text-2xl: 20px` (로고)

#### 폰트 굵기
- `--admin-font-regular: 400`
- `--admin-font-medium: 500`
- `--admin-font-semibold: 600`
- `--admin-font-thin: 100` (도움말 텍스트)

#### 라인 높이
- `--admin-line-height-tight: 1.2`
- `--admin-line-height-normal: 1.4`
- `--admin-line-height-relaxed: 1.5`

### 4.3 간격 (Spacing)

#### 패딩
- `--admin-padding-xs: 4px`
- `--admin-padding-sm: 8px`
- `--admin-padding-md: 12px`
- `--admin-padding-lg: 16px`
- `--admin-padding-xl: 25px`

#### 마진
- `--admin-margin-xs: 4px`
- `--admin-margin-sm: 8px`
- `--admin-margin-md: 12px`
- `--admin-margin-lg: 16px`
- `--admin-margin-xl: 24px`

#### 간격
- `--admin-gap-xs: 4px`
- `--admin-gap-sm: 8px`
- `--admin-gap-md: 12px`
- `--admin-gap-lg: 16px`
- `--admin-gap-xl: 24px`

### 4.4 크기 (Sizes)

#### 아이콘 크기
- `--admin-icon-xs: 16px`
- `--admin-icon-sm: 18px`
- `--admin-icon-md: 22px`
- `--admin-icon-lg: 24px`

#### 입력 필드 높이
- `--admin-input-height-sm: 38px`
- `--admin-input-height-md: 40px`
- `--admin-input-height-lg: 44px`

#### 테이블 높이
- `--admin-table-header-height: 47px`
- `--admin-table-row-height: 50px`

#### 버튼 크기
- `--admin-button-pagination: 28px`
- `--admin-toggle-width: 44px`
- `--admin-toggle-height: 24px`
- `--admin-toggle-thumb: 20px`

### 4.5 Border Radius
- `--admin-radius-sm: 4px`
- `--admin-radius-md: 6px`
- `--admin-radius-lg: 8px`
- `--admin-radius-xl: 12px`
- `--admin-radius-full: 9999px` (토글)

## 5. 컴포넌트의 상태 (States)

### 5.1 AdminSearchInput
- **default**: 배경 #ffffff, 텍스트 #8b909a
- **focus**: 테두리 강조 (선택적)
- **disabled**: 투명도 감소, 포인터 이벤트 없음
- **loading**: 로딩 스피너 표시 (선택적)

### 5.2 AdminDropdown
- **default**: 배경 #ffffff, 텍스트 #8b909a
- **hover**: 배경색 약간 변경 (선택적)
- **focus**: 테두리 강조
- **open**: 드롭다운 메뉴 표시
- **disabled**: 투명도 감소, 포인터 이벤트 없음

### 5.3 AdminToggle
- **checked (on)**: 배경 #1f2937, 원형 버튼 오른쪽
- **unchecked (off)**: 배경 #e5e7eb, 원형 버튼 왼쪽
- **hover**: 약간의 그림자 효과 (선택적)
- **disabled**: 투명도 감소, 포인터 이벤트 없음

### 5.4 AdminMenuItem
- **default**: 투명 배경, 텍스트 #8b909a
- **hover**: 배경색 약간 변경 (선택적)
- **active**: 배경 #f3f4f8, 텍스트 #23272e, SemiBold
- **with-badge**: 보라색 배지 표시 (#7367f0, 16% opacity)

### 5.5 AdminTableRow
- **default**: 배경 #ffffff, 테두리 #e9e7fd
- **hover**: 배경색 약간 변경 (선택적)
- **selected**: 배경색 강조 (선택적)

### 5.6 AdminPageButton
- **default**: 배경 #f1f2f6, 텍스트 #8b909a
- **active**: 배경 #141718, 텍스트 #ffffff
- **hover**: 배경색 약간 변경
- **disabled**: 투명도 감소, 포인터 이벤트 없음

### 5.7 AdminSettingsCard
- **default**: 배경 #ffffff, 테두리 #e5e7eb
- **hover**: 그림자 효과 (선택적)

## 6. 컴포넌트 요약

### 6.1 기존 컴포넌트 확장
- **AdminSidebar**: Logo, Section, MenuItem 통합 필요
- **AdminTable**: Header/Row/Cell 스타일 개선 필요
- **AdminTablePagination**: PageSizeSelector 통합 필요
- **AdminFilterBar**: SearchInput, Dropdown 통합 필요

### 6.2 신규 컴포넌트
- **AdminSearchInput**: 검색 입력 필드
- **AdminDropdown**: 필터 드롭다운
- **AdminToggle**: 토글 스위치
- **AdminSettingsCard**: 설정 카드
- **AdminMenuItem**: 사이드바 메뉴 아이템
- **AdminPageSizeSelector**: 페이지 크기 선택

### 6.3 우선순위
1. **높음**: AdminSidebar 확장, AdminSearchInput, AdminDropdown
2. **중간**: AdminToggle, AdminSettingsCard, AdminMenuItem
3. **낮음**: AdminPageSizeSelector, AdminTable 세부 컴포넌트

