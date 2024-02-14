import { ReactNode } from "react";
import { UserProvider } from "./User";

const Providers: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (<>
        <UserProvider>
            {children}
        </UserProvider>
    </>)
}
export default Providers;