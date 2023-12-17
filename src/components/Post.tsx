import Image from "next/image";
import { useContext, useEffect, useRef, useState } from "react";
import { getUserbyUid, deletePost, updatePostLikes, updatePostComments } from "@/firebase/functions";
import { DocumentData } from "firebase/firestore";
import { Button, IconButton, Input, Typography, input } from "@material-tailwind/react";
import { TrashIcon } from "@heroicons/react/20/solid";
import { AuthContext } from "@/context/AuthContext";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/router";
import {
  FaceSmileIcon,
  ChatBubbleBottomCenterIcon,
  HeartIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import {HeartIcon as HeartIconFilled} from "@heroicons/react/20/solid"
import Moment from "react-moment"

export default function Post({
  id,
  posts,
  setPosts = "default",
  sample,
}: {
  id: string;
  posts: any;
  setPosts: any;
  sample:any
}) {

  const [src, setSrc] = useState<string>("");
  const [post, setPost] = useState<DocumentData | undefined | boolean | any>();
  const user:any = useContext(AuthContext);
  const [comment, setComment] = useState('');
  const [ready, setReady] = useState(false);
  const [userObj, setUserObj] = useState<any | any >();
  const [likes, setLikes] = useState<string[]>([]);

  //this is used to set the cursor to comment box when clicking comment button
  const inputRef = useRef<HTMLInputElement>(null);

  const router = useRouter()
  const currentUrl = router.asPath

  useEffect(() => {
    setReady(false);
    const getSrc = async () => {
     
      //get post from posts context
      const post = posts.find((post: { post_id: string; }) => post.post_id === id);

      //order comments by timestamp
      if (post?.comments){
        post.comments.sort((a: { timestamp: string; }, b: { timestamp: string; }) => {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });

        //update usernames on comments

        for (let i=0; i<post.comments.length; i++){
          let ret_user:any = await getUserbyUid(post.comments[i].userid)
          post.comments[i].username = ret_user.displayName
        }
      }

      

      try {
        const res = await fetch(`/api/image?url=${post?.imageURL}`)
        const {imageUrl} = await res.json();
        // Set state
        setPost(post);
        setSrc(imageUrl);
        setLikes(post?.likes)
      } catch (error) {
        console.log(error)
      }
      
    };
    async function getUser() {
      if (post?.userid) {
        const user = await getUserbyUid(post.userid);
        if (user){
        
        setUserObj(user);
        setReady(true);
        }
      }
    }

    if (post != false){
      getUser();
      getSrc();
    }
   
    

  }, [id, user, post]);

  const handleLike = async () => {
    try {
      if (user){
        await updatePostLikes (post?.post_id, post?.userid, user?.uid)
        //update post context
        const newLikes = [...post?.likes, user?.uid];
        post.likes = newLikes;
        setPost(post);
        setLikes(newLikes);
        if (setPosts !== "default"){
          const postIndex = posts.findIndex((postToFind: { post_id: any; }) => postToFind.post_id === post?.post_id);
          if (postIndex !== -1){
            const newPosts = [...posts];
            newPosts[postIndex] = post;
            setPosts(newPosts)
          }
        }
      }
      
    } catch (error) {
      alert(error)
    }
  }

  const focusInput = async () => {
    if (inputRef.current) {
      inputRef?.current?.focus();
    }

  }

  const handleUnLike = async () => {
    try {
      if (user){
        await updatePostLikes (post?.post_id, post?.userid, user?.uid)
        //update post context
        const newLikes = post?.likes.filter((like: string) => like !== user?.uid);
        post.likes = newLikes;
        setPost(post);
        setLikes(newLikes);
        if (setPosts !== "default"){
          const postIndex = posts.findIndex((postToFind: { post_id: any; }) => postToFind.post_id === post?.post_id);
          if (postIndex !== -1){
            const newPosts = [...posts];
            newPosts[postIndex] = post;
            setPosts(newPosts)
          }
        }
      }
      
    } catch (error) {
      alert(error)
    }
  }

  const handleDownload = async (e:any) => {
    try {
      const response = await fetch(e);
      const blob = await response.blob();

      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = post?.description;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.value = e.target.value.substring(0, 59)
    setComment(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (comment && user?.uid) {

        if (comment.length >59){
          comment.substring(0, 59)
        }

        if (/^\s*$/.test(comment)){
          throw "comment can't be just spaces"
        }
        //create comment object
        const comment_obj:any = {
          uid: uuidv4(),
          comment: comment,
          userid: user?.uid,
          username: user?.displayName,
          profile_img: userObj?.profile_img,
          timestamp: new Date().toISOString(),
        };
        await updatePostComments(post?.post_id, comment_obj, user?.uid);
        post?.comments.push(comment_obj);

        //resort comments by timestamp
        post?.comments.sort((a: { timestamp: string; }, b: { timestamp: string; }) => {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
        setPost(post);
        setComment('');
        if (setPosts !== "default"){
          const postIndex = posts.findIndex((postToFind: { post_id: any; }) => postToFind.post_id === post?.post_id);
          if (postIndex !== -1){
            const newPosts = [...posts];
            newPosts[postIndex] = post;
            setPosts(newPosts)
          }
        }
      }
    } catch (e) {
      alert(e);
    }
  };

  return (
    <>
    {(ready && post != false)? (

      <div className="bg-blue-gray-800 my-7 border rounded-xl text-white !important max-w-500 overflow-x-hidden">
        <div className="flex items-center p-5">
          <Image 
            src={userObj?.profile_img === 'empty-profile.png' ? '/../empty-profile.png' : `/${userObj?.profile_img}`}
            width={500} 
            height={500} 
            className="rounded-full h-12 w-12 object-contain border-2 p-1 mr-3" 
            alt={"profile picture for " + userObj?.displayName}
          />
          <p className="flex-1 font-bold text-white">{userObj?.displayName}</p>
        </div>
        {src.length ? 
        (
        
          <Image 
          src={src} 
          alt="user post" 
          className="object-cover w-full bg-white"
          height={750}
          width={750}
          />
        ) : (<div>loading</div>)}


        {(!sample ? (
                  <div className="flex space-x-4 p-4">
         
                  {(!likes.includes(user?.uid) 
                  ?  <HeartIcon onClick={handleLike} className='btn text-white'/> :
                  <HeartIconFilled onClick={handleUnLike} className='btn text-red-500'/>
                  )}
                  <ChatBubbleBottomCenterIcon onClick={focusInput} className='btn text-white'/>
                  <PaperAirplaneIcon onClick={() => (handleDownload(src))} className='btn text-white'/>
                </div>
        ) : (<div></div>))}
       
          
        {/* Caption */}

        <div className="px-5 py-3 truncate">
        {likes.length > 0 && (
            <>
            {likes.length > 1 ? (
            <p className="font-bold mb-1">{likes.length} likes</p>) : (
            <p className="font-bold mb-1">{likes.length} like</p>)}
            </>
          )
          }
          <span className="font-bold mr-1 ml-1">{userObj?.displayName}</span>
          <span>{post?.description}</span>
        </div>

        {/* Comments */}

        {(!sample ? (
          <div className="ml-10 h-20 overflow-y-scroll scrollbar-thumb-white scrollbar-thin">
            {(post && post?.comments) && (
                <div>
                  {post.comments.map((postComment: any) => (
                    <div key={postComment.uid} className="flex items-center space-x-2 ab-3 p-2 block">
                      <Image 
                        src={postComment?.profile_img === 'empty-profile.png' ? '/../empty-profile.png' : '/' + postComment?.profile_img}
                        alt={"comment profile picture for user " + postComment?.username}
                        className="rounded-full h-8 w-8 object-contain"
                        width={500} 
                        height={500} 
                      />
                      <p className="text-sm flex-1 truncate space-x-4 overflow-ellipsis block whitespace-no-wrap">
                        <span className="font-bold mr-2">{postComment?.username}</span>
                        {postComment?.comment}
                      </p>

                      <Moment fromNow className="pr-5 text-xs">
                        {postComment?.timestamp}
                      </Moment>

                    </div>
                  ))}
                </div>)
            } 
         </div>
        ) : (<div></div>))}
        



        {/* Input Box */}

        {(!sample ? (
          <form onSubmit={handleSubmit} className="flex items-center space-x-3 p-4">
            <FaceSmileIcon className='h-7'/>
            <input 
              ref={inputRef}
              type="text" 
              value={comment}
              onChange={handleCommentChange}
              placeholder="Add a comment..."
              className="bg-blue-gray-400 p-1 border-none flex-1 focus:ring-0 outline=none text-sm" />
            <button disabled={!comment.trim()} type='submit' className="font-semibold btn">Post</button>
          </form>
        ) : (<div></div>))}


        <div className="flex justify-center">

        {(post && currentUrl == '/profile' && post?.userid == user?.uid) && (
            <IconButton
              variant="outlined"
              className="m-5"
              onClick={async () => {
                let old_id = post.post_id
                try {
                  await deletePost(id);
                } catch (error) {
                  console.log(error)
                }
                
                //remove post from posts context
                if (setPosts != "default"){
                  //need to remore post from posts state so that it updates the profile stats
                  posts = posts.filter((e:any) => e.post_id != old_id)
                  setPosts(posts)
                }
                setPost(false);
              }}
            >
              <TrashIcon title="Delete Post" className="w-full h-full p-0 m-0 text-white" />
            </IconButton>
          )}

        </div>

          
    </div>

    ): (post != false && <div>loading</div>)}
    </>
    

  );
}
