/**
 * 이력서·경력증명서 하드코딩 데이터.
 * DB/API 연동 없음.
 */

export type CareerItem = {
  company: string;
  period: string;
  position: string;
  duties: string[];
};

export type EducationItem = {
  school: string;
  period: string;
  major: string;
  degree: string;
};

export type CertificationItem = {
  name: string;
  issuer?: string;
  date?: string;
};

export type ResumeData = {
  name: string;
  email: string;
  contact?: string;
  summary?: string;
  career: CareerItem[];
  education: EducationItem[];
  skills: string[];
  certifications: CertificationItem[];
};
export const resumeData: ResumeData = {
  name: "이유정",
  email: "idoasisy.yc@gmail.com",
  contact: "010-0000-0000", // 실제 번호로 수정 필요
  summary:
    "0에서 1을 만드는 과정에서의 기술적 문제를 정의하고 해결하는 엔지니어입니다. 웹 서비스 기획부터 배포, 운영 프로세스 구축까지 전 과정을 주도적으로 수행하며 비즈니스 성장에 기여합니다.",
  career: [
    {
      company: "AAC",
      period: "2024.10 – 현재",
      position: "Software Engineer",
      duties: [
        "신규 웹 서비스 아키텍처 설계 및 풀스택 개발 주도",
        "서비스 확장을 위한 웹 보일러플레이트 구축 및 배포 자동화 파이프라인 수립",
        "비즈니스 관점의 CRM(고객 관계 관리) 시스템 및 키오스크 인터페이스 설계/구현",
        "초기 제품 릴리즈 및 안정화를 위한 지속적인 유지보수 및 기능 고도화",
      ],
    },
    {
      company: "Codestates",
      period: "2019.09 – 2023.05",
      position: "Technical Instructor & Developer",
      duties: [
        "CS 기초(알고리즘, 자료구조) 및 프론트엔드/백엔드 통합 커리큘럼 강의",
        "블록체인 기술 원리 및 스마트 컨트랙트 활용 기술 교육",
        "수강생의 기술적 성장을 위한 코드 리뷰 및 프로젝트 멘토링 수행",
      ],
    },
  ],
  education: [
    {
      school: "계원예술대학교",
      period: "2014.03 – 2019.09",
      major: "애니메이션학과",
      degree: "학사",
    },
  ],
  skills: ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "Flutter"],
  certifications: [{ name: "직업능력개발훈련교사 자격 (정보통신 분야)", issuer: "고용노동부", date: "2019" }],
};
