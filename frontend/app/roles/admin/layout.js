import "./page.css";
import {
  LayoutProvider,
  Sidebar,
  MainContent,
} from "../../component/layout/index";
export const metadata = {
  title: "Admin",
  description: "This is Admin side",
};

export default function OfficerLayout({ children }) {
  return (
    <LayoutProvider>
      <div className="flex min-h-screen overflow-hidden">
        <Sidebar />
        <MainContent className="flex-1 flex flex-col min-w-0 bg-[#f8f9fa]">
          {children}
        </MainContent>
      </div>
    </LayoutProvider>
  );
}