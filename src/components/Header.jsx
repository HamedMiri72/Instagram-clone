'use client'

import Image from 'next/image'
import Link from 'next/link'
import { signIn, signOut } from 'next-auth/react'
import { useSession } from 'next-auth/react'
import Modal from "react-modal"
import React, { useEffect, useRef, useState } from 'react'
import { MdAddCircleOutline } from "react-icons/md";
import {HiCamera} from "react-icons/hi"
import {AiOutlineClose} from "react-icons/ai"
import {app} from "@/firebase"
import { getDownloadURL, getStorage, uploadBytesResumable, ref } from "firebase/storage";



export default function Header() {

    const {data: session} = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [imageFileUrl, setImageFileUrl]  = useState(null);
    const [imageFileUploading, setImageFileUploading] = useState(false);
    const filePickerRef = useRef(null);

    function addImageToPost(e){
        const file = e.target.files[0];
        if(file){
            setSelectedFile(file);
            setImageFileUrl(URL.createObjectURL(file));
            
        }
    }

    useEffect(() => {
        if (selectedFile){
            uploadImageToStorage()
        }
    }, [selectedFile])
    console.log(session);

    async function uploadImageToStorage(){
        setImageFileUploading(true);
        const storage = getStorage(app);
        const fileName = new Date().getTime() + "-" + selectedFile.name;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, selectedFile);
        uploadTask.on(
            'state_changed',
            (snapshot)=>{
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes)
                * 100;
                console.log('upload is' + progress + '% done');
            },
            (error) => {
                console.log(error);
                setImageFileUploading(false);
                setImageFileUrl(null);
                setSelectedFile(null);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then
                ((downloadUrl) => {
                    setImageFileUrl(downloadUrl);
                    setImageFileUploading(false);
                });
            }

            
        );

    }
  return (
    <header className='shadow-sm border-b sticky top-0 bg-white z-30 p-3'>
        <div className='flex items-center justify-between max-w-6xl mx-auto '>

            <Link href ={'/'} className='hidden lg:inline-flex'>

                <Image
                    src='/Instagram_logo_black.webp'
                    width={96}
                    height={96}
                    alt='instagram logo'
                
                />
            
            </Link>

            <Link href ={'/'} className='lg:hidden '>

                <Image
                    src='/800px-Instagram_logo_2016.webp'
                    width={40}
                    height={40}
                    alt='instagram logo'
                
                />
            
            </Link>


            <input type="text" placeholder='Search' className='bg-gray-50 border border-gray-200 rounded text-sm w-full px-4 py-2 max-w-[210px] outline-none'/>

            {session ? (
                <div className='flex gap-2 items-center'>
                <MdAddCircleOutline className='text-2xl cursor-pointer transfrom hover:scale-125 transition duration-300 hover:text-red-600'
                onClick={() => setIsOpen(true)}/>

                <img className='rounded-full w-10 h-10 cursor-pointer' src={session.user.image} alt={session.user.name} onClick={()=> signOut()} />


                </div>
            ):(
                <button onClick={() => signIn()} className='text-sm font-semibold text-blue-500'>Log In</button>
            
            
            )}

            {isOpen && (
                <Modal isOpen={isOpen} className='max-w-lg w-[90%] p-6 absolute top-56 left-[50%] translate-x-[-50%] bg-white border-2 rounded-md shadow-md'
                onRequestClose={()=> setIsOpen(false)}
                ariaHideApp={false}>

                    <div className='flex flex-col justify-center items-center h-[100%]'>

                        {selectedFile ? (
                            <img onClick={()=> setSelectedFile(null)} src={imageFileUrl} alt='selected file' className='w-full max-h-[250px] object-fit cursor-pointer'/>
                        ):(
                        <HiCamera onClick={()=>filePickerRef.current.click()} className='text-5xl text-gray-400 cursor-pointer'/>
                        )}

                        <input  hidden ref={filePickerRef} type="file" accept='image/*' onChange={addImageToPost}/>

                        <input type="text" maxLength="150" placeholder='Please Enter Your Caption...' className='m-4 border-none text-centerw-full focus:ring-0 outline-none '/>

                        <button className='w-full bg-red-600 text-white p-2 shadow-md rounded-lg hover:brightness-105 disabled:bg-gray-200 disabled:cursor-not-allowed disabled:hover:brightness-100'>Upload Post</button>
                    </div>


                    <AiOutlineClose onClick={() => setIsOpen(false)} className='absolute top-2 cursor-pointer right-2 border-none text-gray-500  hover:border hover:text-red-600 transition duration-300'/>

                    

                </Modal>
            )}
            

        </div>
    </header>
  )
}
