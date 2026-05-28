import { useEffect, useRef, useState } from "react";




function Multifilter({ options }) {
    const [searchtext, usesearchtext] = useState('');
    const [filtertext, usefilter] = useState([]);
    const [selectedoptions, setselectedoptions] = useState([]);
    const [active, setactive] = useState(false);
    const selectedref = useRef(true);

useEffect(()=>{
    const closehandler=(event)=>{
        if(selectedref.current && !event.composedPath().includes(selectedref.current)){
            setactive(false);
        }
    }
    document.addEventListener('click',closehandler);
    return()=>{
        document.removeEventListener('click',closehandler)
    }



},[selectedref.current])


    const setoption = (value) => {
        if (selectedoptions.includes(value)) {
            const opts = selectedoptions.filter(item => item !== value);
            setselectedoptions([...opts])

        }
        else {
            setselectedoptions([...selectedoptions, value])
        }
    }

    useEffect(() => {

        const match = options.filter(item => item?.value.toLowerCase().includes(searchtext?.toLowerCase()))
        if (match) {
            usefilter(match)
        }
        else {
            usefilter(options)
        }

    }, [searchtext])

    return (
        <>
            <div className="main-cont" ref={selectedref}>
                <div>
                    <div className="list-selected">
                        {
                            selectedoptions.map(opt => {
                                return (
                                    <span className='span' key={opt}>{opt}</span>
                                )
                            })
                        }
                    </div>
                    <input className='search-options' onChange={(e) => { usesearchtext(e.target.value) }} onClick={()=>{setactive(true)}} type="text" placeholder="search" />
                </div>
                {
                    active && <div className="option">
                        {
                            filtertext.map(Option => {
                                return (
                                    <div key={Option.value} className="list-options"
                                        onClick={() => setoption(Option.value)}
                                    >
                                        <input className="check" checked={selectedoptions.includes(Option.value)} type="checkbox" name="" id="" />
                                        {Option.label}
                                    </div>
                                )
                            })
                        }
                    </div>
                }
            </div>
        </>
    )
}

export default Multifilter;