"use client";

import { createContext } from "react";

/** 대표 이미지(썸네일)로 지정된 이미지의 src URL. 에디터에서 해당 이미지에 "대표" 뱃지를 표시할 때 사용. */
export const RepresentativeImageContext = createContext(null);
