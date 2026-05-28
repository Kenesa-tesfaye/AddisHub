import Home1 from "../Home1";
import Homeskeleton from "./Homeskeleton";
import { useState, useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import './skeleton2.css'

function Home() {
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setTimeout(() => {
            setLoading(false)
        }, 1000)
    }, [])
    return (
        <>
            {
                loading ?
                    (
                        <div className="body">

                            <div className="t">
                                <div className="logo">
                                    <Skeleton height='70px' width='80px' borderRadius='50%' />

                                </div>

                                <div className="t-me">

                                    <Skeleton height={24} width='100px' borderRadius='50px' />
                                    <Skeleton height={24} width='100px' borderRadius='50px' />
                                    <Skeleton height={24} width='100px' borderRadius='50px' />
                                    <Skeleton height={24} width='100px' borderRadius='50px' />
                                </div>

                                <div className="buttonske">
                                    <Skeleton height={40} width='130px' borderRadius='40px' />
                                </div>
                            </div>

                            <div className="in-text-s">
                                    <Skeleton height='70px' width='450px' borderRadius='30px'/>
                                    <Skeleton height='30px' width='530px' borderRadius='50px'/>
                                    <Skeleton height={40} width='130px' borderRadius='40px' border='1px solid #838282'/>
                            </div>
                            <div className="card1-s">
                                 <div className="te-cr">
                                    <Skeleton height='40px' width='100px' borderRadius='20px'/>
                                    <Skeleton height='30px' width='100px' borderRadius='20px'/>
                                </div>
                                <div className="te-bk">
                                    <Skeleton height='90px' width='90px' borderRadius='20px'/>
                                    <Skeleton height='40px' width='100px' borderRadius='20px'/>
                                </div>
                            </div>
                            <div className="card2-s">
                                <div className="te-cr">
                                    <Skeleton height='40px' width='100px' borderRadius='20px'/>
                                    <Skeleton height='30px' width='100px' borderRadius='20px'/>
                                </div>
                                <div className="te-bk">
                                    <Skeleton height='90px' width='90px' borderRadius='20px'/>
                                    <Skeleton height='40px' width='100px' borderRadius='20px'/>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Home1 />
                    )
            }



        </>
    )
}
export default Home;