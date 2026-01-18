"use client";

import { create } from "zustand";

// SearchState 인터페이스
export interface SearchState {
  isOpen: boolean;
  keyword: string;
  open: () => void;
  close: () => void;
  setKeyword: (value: string) => void;
  clear: () => void;
}

// 검색 스토어 생성
export const useSearchStore = create<SearchState>((set) => ({
  isOpen: false,
  keyword: "",

  // 검색바 열기
  open: () => {
    set({ isOpen: true });
  },

  // 검색바 닫기 (keyword는 유지)
  close: () => {
    set({ isOpen: false });
  },

  // 검색어 설정
  setKeyword: (value: string) => {
    set({ keyword: value });
  },

  // 검색바 닫기 + 검색어 초기화
  clear: () => {
    set({ isOpen: false, keyword: "" });
  },
}));
