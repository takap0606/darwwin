import {
  useState,
  ReactNode,
  createContext,
  Dispatch,
  SetStateAction,
} from 'react';

export type User = {
  nickname: string;
  walletAddress: string | undefined;
  peEmail: string | undefined;
  peUsername: string | undefined;
  registeredDate: string | undefined;
  imageUrl: string | undefined;
  invitationCode: string | undefined;
  rate: number | undefined;
};

type UserContext = {
  userInfo: User;
  setUserInfo: Dispatch<SetStateAction<User>>;
};

export const UserContext = createContext<UserContext>({} as UserContext);

type Props = {
  children: ReactNode;
};

export const UserProvider = ({ children }: Props) => {
  const [userInfo, setUserInfo] = useState<User>({
    nickname: '',
    walletAddress: '',
    peEmail: '',
    peUsername: '',
    registeredDate: '',
    imageUrl: '',
    invitationCode: '',
    rate: 0,
  });

  return (
    <UserContext.Provider value={{ userInfo, setUserInfo }}>
      {children}
    </UserContext.Provider>
  );
};
