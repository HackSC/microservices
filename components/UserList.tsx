
// @ts-nocheck
import { useState } from 'react'
import ReactModal from 'react-modal'
import dynamic from 'next/dynamic'
import Skeleton from 'react-loading-skeleton';
const ReactJson = dynamic(() => import('react-json-view'), { ssr: false })

export default function UserList({ data, error }: any) {
    const [show, setShow] = useState(false)
    const [visibleUser, setVisibleUser] = useState({})
    if (error) return <div>failed to load</div>
    ReactModal.setAppElement("#__next")
    const handleClick = (id: string) => {
        setShow(!show)
        const userData = data[id]
        setVisibleUser(userData)
    }

    return (
        <div style={{marginLeft: 24, maxWidth: 500, minWidth: 200, width: '100%'}}>
            <p>{data ? `Total members: ${Object.values(data).length}` : <>Total members: <Skeleton width={25} height={20} /></>}</p>
            <ul>
                {data ? (Object.values(data).map((e: any) => {
                    if (e.is_admin) {
                        return (<li key={e.id} style={{cursor: 'pointer', textDecoration: 'underline'}} onClick={() => handleClick(e.id)}><img src={e.profile.image_24} height={12} width={12}  style={{marginRight: 4}}/><strong>{e.name} - {e.real_name}</strong></li>)
                    }
                    return (<li key={e.id} style={{cursor: 'pointer', textDecoration: 'underline'}} onClick={() => handleClick(e.id)}><img src={e.profile.image_24} height={12} width={12} style={{marginRight: 4}}/>{e.name} - {e.real_name}</li>)
                })) : ([...Array(10)].map((e, i) => <li key={i} ><Skeleton width={20} height={20} style={{marginRight: 4}}/><Skeleton height={20} width={'80%'} /></li>))}
            </ul>

            
            <ReactModal 
                isOpen={show}
                contentLabel={visibleUser ? `${visibleUser.name} - ${visibleUser.id}` : ""}
             >
                <button onClick={() => setShow(false)}>Close Modal</button>
                 {visibleUser && <ReactJson src={visibleUser} />}
                <button onClick={() => setShow(false)}>Close Modal</button>
            </ReactModal>

            <style jsx>{`
                ul {
                    list-style-type: none;
                    padding: 0; /* Remove padding */
                        margin: 0; /* Remove margins */
                }
                li {
                    margin-top: 3px;
                    margin-bottom: 3px;
                }
            `}</style>
        </div>
    )
}