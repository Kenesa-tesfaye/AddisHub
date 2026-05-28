import { FaEdit, FaEye, FaHeart, FaTrash } from 'react-icons/fa'
import './main-pages-admin.css'
import { Box, Button, Typography } from '@mui/material'
import image1 from '../../../assets/main.png'
import { Link } from 'react-router'
import { useState } from 'react'



function Resourcesadmin() {
    const [expand, setexpand] = useState(false)

    let limit = 37
    let height = 50

    const text = 'Would you like me to extend this with a fadeout effect (like Instagram does) so the truncated text visually hints there’s more content?Got it — you want the “See more / See less” toggle inside your resource card description, just like Instagram captions. That’s a neat way to keep cards compact while still letting users expand for full detail. Here’s a production‑ready React + Material UI pattern you can drop into your CRH resource cards:'

    const toggleexpand = () => setexpand(!expand);

    const displayText = expand ? text : text.slice(0, limit);
    return (
        <>
            <div className="resource-admin-conatiner">
                <div className="header-contain">

                </div>
                <div className="res-card-container">
                    <div className="re-card">

                        <div className="fav">
                            <Button variant='contain'>
                                <FaEdit color='#1976d2' />
                            </Button>
                            <Button variant='contain' color="success">
                                <FaTrash color='red' />
                            </Button>
                        </div>
                        <div className="profile-pic">
                            <img src={image1} alt="" />
                        </div>
                        <div className={`bottom ${expand ? 'active' : ''}`}>
                            <h1>HPL trading</h1>
                            <div className="description">
                                <Box
                                    sx={{
                                        position: "relative",
                                        height,
                                        overflowY: "auto",
                                        // padding for scrollbar
                                    }}
                                ></Box>

                                <Typography variant="body2" color="text.secondary" sx={{
                                    fontSize: '11px'
                                }}>
                                    {displayText}
                                    {!expand && text.length > limit && "..."}
                                </Typography>
                                {text.length > limit && (
                                    <Button
                                        size="small"
                                        onClick={toggleexpand}
                                        sx={{
                                            textTransform: "none",
                                            mt: 1,
                                            fontSize: '10px'

                                        }}
                                    >
                                        {expand ? "See less" : "See more"}
                                    </Button>
                                )}
                                <Box
                                    sx={{
                                        position: "sticky",
                                        bottom: 0,
                                        height: 40,
                                        background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                                        pointerEvents: "none",
                                    }}
                                >
                                </Box>

                            </div>

                            <div className="minors">
                                <h3>Education</h3>
                                <h3>Mexico</h3>
                            </div>
                            <div className="engagement">
                                <div className="like">
                                    <FaHeart fontSize={25}
                                        style={{
                                            fill: 'none',
                                            stroke: '#fff',
                                            strokeWidth: 25,
                                            color:'#db0f0f'
                                        }}
                                    className='like-bt'/>
                                    <p>3k</p>
                                </div>
                                <div className="testimonials">
                                    <img src="" />
                                </div>
                                <div className="view">
                                    <FaEye fontSize={25} color='#ffffff4b' />
                                    <p>4M</p>
                                </div>
                            </div>
                            <div className="view-detail">
                                <Link to='/Carddetail'>View Detail</Link>
                            </div>
                        </div>
                    </div>
                    <div className="re-card">

                        <div className="fav">
                            <Button variant='contain'>
                                <FaEdit color='#fff' />
                            </Button>
                            <Button variant='contain' color="success">
                                <FaTrash color='#fff' />
                            </Button>
                        </div>
                        <div className="profile-pic">
                            <img src={image1} alt="" />
                        </div>
                        <div className={`bottom ${expand ? 'active' : ''}`}>
                            <h1>HPL trading</h1>
                            <div className="description">
                                <Box
                                    sx={{
                                        position: "relative",
                                        height,
                                        overflowY: "auto",
                                        // padding for scrollbar
                                    }}
                                ></Box>

                                <Typography variant="body2" color="text.secondary" sx={{
                                    fontSize: '11px'
                                }}>
                                    {displayText}
                                    {!expand && text.length > limit && "..."}
                                </Typography>
                                {text.length > limit && (
                                    <Button
                                        size="small"
                                        onClick={toggleexpand}
                                        sx={{
                                            textTransform: "none",
                                            mt: 1,
                                            fontSize: '10px'

                                        }}
                                    >
                                        {expand ? "See less" : "See more"}
                                    </Button>
                                )}
                                <Box
                                    sx={{
                                        position: "sticky",
                                        bottom: 0,
                                        height: 40,
                                        background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                                        pointerEvents: "none",
                                    }}
                                >
                                </Box>

                            </div>

                            <div className="minors">
                                <h3>Education</h3>
                                <h3>Mexico</h3>
                            </div>
                            <div className="engagement">
                                <div className="like">
                                    <FaHeart fontSize={25} />
                                    <p>3k</p>
                                </div>
                                <div className="testimonials">
                                    <img src="" />
                                </div>
                                <div className="view">
                                    <FaEye fontSize={25} color='#f0ebeb83' />
                                    <p>4M</p>
                                </div>
                            </div>
                            <div className="view-detail">
                                <Link to='/Carddetail'>View Detail</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </>
    )
}
export default Resourcesadmin;