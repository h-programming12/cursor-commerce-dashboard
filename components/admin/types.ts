export interface AdminTableColumn<T = Record<string, unknown>> {
  key: string;
  label: string;
  width?: string | number;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface AdminMetric {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export interface AdminMenuItemData {
  icon?: React.ReactNode;
  label: string;
  href?: string;
  active?: boolean;
  badge?: number | string;
  hasSubmenu?: boolean;
  onClick?: () => void;
}

export interface AdminMenuSection {
  section?: string;
  items: AdminMenuItemData[];
}

export interface AdminSearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export interface AdminDropdownProps {
  placeholder?: string;
  value?: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export interface AdminToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export interface AdminSettingsCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  iconBgColor?: string;
  children: React.ReactNode;
  className?: string;
}

export interface AdminPageSizeSelectorProps {
  value: number;
  options: number[];
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

export interface AdminSidebarProps {
  logo?: React.ReactNode;
  menuItems: AdminMenuSection[];
  className?: string;
}

export interface AdminTableProps<T = Record<string, unknown>> {
  columns: AdminTableColumn<T>[];
  data: T[];
  renderCell?: (column: string, row: T) => React.ReactNode;
  className?: string;
}

export interface AdminTablePaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  className?: string;
}
