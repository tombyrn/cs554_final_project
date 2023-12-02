import { AuthContext } from "@/context/AuthContext";
import { changePassword, updateDisplayName } from "@/firebase/functions";
import { Avatar, Button, Input, Typography } from "@material-tailwind/react";
import { useRouter } from "next/router";
import { useContext, useState } from "react";


export default function EditProfile (){
    const user = useContext(AuthContext);
    const [editName, setEditName] = useState(false);
    const [editPassword, setEditPassword] = useState(false);
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const router = useRouter();
    if(!user) router.push('/login');
    

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        if(editName){ 
            try{
                await updateDisplayName(displayName)
                setEditName(false)          
            }
            catch(error){
                alert(error)
            }
        }
        else if (editPassword){
        
            const email = form.elements.namedItem("email") as HTMLInputElement;
            try{
                await updateDisplayName(displayName)
                await changePassword(email.value, oldPassword, newPassword)
                setEditPassword(false)
            }
            catch(error){
                alert(error)
            }     
        }
    }

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDisplayName(e.target.value)
    }

    const handleOldPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOldPassword(e.target.value)
    }
    const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewPassword(e.target.value)
    }

    if(editName){
        return(
            <div className="flex-grow box-border w-32 p-4 border-4 mr-4 rounded-lg flex flex-col items-center justify-center">
                <Avatar className="my-2" src={user?.photoURL || ""} alt="avatar" size="xxl"/>
                <form onSubmit={handleSubmit}>
                    <Typography variant="h6" color="blue-gray" className="my-2">Your Name</Typography>
                    <Input
                        name="displayName" 
                        size="lg"
                        value= {displayName}
                        onChange={handleNameChange}
                        crossOrigin="anonymous"
                        className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                        labelProps={{
                            className: "before:content-none after:content-none",
                    }}/>
                    <Typography variant="h6" color="blue-gray" className="my-2">Your Email</Typography>
                    <Input
                        name="email" 
                        size="lg"
                        readOnly
                        value={user?.email || ''}
                        crossOrigin="anonymous"
                        className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                        labelProps={{
                            className: "before:content-none after:content-none",
                    }}/>
                    <Button className="mt-6" fullWidth type="submit">Submit</Button>
                </form>
            </div>
        )
    }
    else if(editPassword){
        return(
            <div className="flex-grow box-border w-32 p-4 border-4 mr-4 rounded-lg flex flex-col items-center justify-center">
                <Avatar className="my-2"src={user?.photoURL || ""} alt="avatar" size="xxl"/>
                <form onSubmit={handleSubmit}>
                    <Typography variant="h6" color="blue-gray" className="my-2">Your Name</Typography>
                    <Input
                        name="displayName" 
                        size="lg"
                        value={displayName || ''}
                        onChange={handleNameChange}
                        crossOrigin="anonymous"
                        className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                        labelProps={{
                            className: "before:content-none after:content-none",
                    }}/>
                    <Typography variant="h6" color="blue-gray" className="my-2">Your Email</Typography>
                    <Input
                        name="email" 
                        size="lg"
                        value={user?.email || ''}
                        crossOrigin="anonymous"
                        className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                        labelProps={{
                            className: "before:content-none after:content-none",
                    }}/>
                    <Typography variant="h6" color="blue-gray" className="my-2">Old Password</Typography>
                    <Input
                        name="oldPassword" 
                        type="password"
                        size="lg"
                        onChange={handleOldPasswordChange}
                        placeholder="************"
                        crossOrigin="anonymous"
                        className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                        labelProps={{
                            className: "before:content-none after:content-none",
                    }}/>
                    <Typography variant="h6" color="blue-gray" className="my-2">New Password</Typography>
                    <Input
                        name="newPassword" 
                        type="password"
                        size="lg"
                        onChange={handleNewPasswordChange}
                        placeholder="************"
                        crossOrigin="anonymous"
                        className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                        labelProps={{
                            className: "before:content-none after:content-none",
                    }}/>
                    <Button className="mt-6" fullWidth type="submit">Submit</Button>
                </form>
            </div>
        )
    }
    
    return (
        <div className="flex-grow box-border w-32 p-4 border-4 mr-4 rounded-lg flex flex-col items-center justify-center">
            <Avatar className="my-2"src={user?.photoURL || ""} alt="avatar" size="xxl"/>
            <Typography variant="h5" className="">{`Your Name: ${user?.displayName}`} </Typography>
            <Typography variant="h5" className="">{`Your email: ${user?.email}`} </Typography>
            <Button color="blue-gray" variant="gradient" className="my-2" onClick={() => setEditName(true)}>Edit Display Name</Button>
            <Button color="blue-gray" variant="gradient" className="my-2" onClick={() => setEditPassword(true)}>Edit Password</Button>
        </div>
    )
}