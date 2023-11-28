import { useRouter } from "next/router";
import { PencilSquareIcon, RectangleStackIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import {
  Navbar,
  Typography,
  IconButton,
  Button,
  Input,
} from "@material-tailwind/react";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { logOutUser } from "@/firebase/functions";

export default function Navigation() {
    const router = useRouter();
    const user = useContext(AuthContext);
    const pageName = router.asPath.slice(1, router.asPath.length)
  return (
    <Navbar
      variant="gradient"
      color="blue-gray"
      className="mx-auto max-w-screen-xl from-blue-gray-900 to-blue-gray-800 px-4 py-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-y-4 text-white">
        <Typography
          as="a"
          href="#"
          variant="h6"
          className="mr-4 ml-2 cursor-pointer py-1.5 capitalize"
        >
          {pageName}
        </Typography>

        <div className="ml-auto flex gap-1 md:mr-4">
          <IconButton title="Feed" variant="text" color="white" onClick={() => router.push('/feed')}>
            <RectangleStackIcon className="h-4 w-4" />
          </IconButton>
          <IconButton title="Profile" variant="text" color="white" onClick={() => router.push('/profile')}>
            <UserCircleIcon className="h-4 w-4" />
          </IconButton>
          <IconButton title="Canvas" variant="text" color="white" onClick={() => router.push('/canvas')}>
            <PencilSquareIcon className="h-4 w-4" />
          </IconButton>

            {user ? <Button onClick={() => logOutUser()}>Sign Out</Button> : <Button onClick={() => router.push('/login')}>Log In</Button>}
        </div>


        
      </div>
    </Navbar>
  );
}
