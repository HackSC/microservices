// @ts-nocheck
import { useMemo, useState } from 'react'
import { useTable, useSortBy } from 'react-table'
import dynamic from 'next/dynamic'
import Skeleton from 'react-loading-skeleton'
import axios from 'axios'
import useSWR from 'swr'

const ReactJson = dynamic(() => import('react-json-view'), { ssr: false })
const ReactModal = dynamic(() => import('react-modal'), { ssr: false })

const booleanValue = (accessor: any) => {
    console.log(accessor)
    return (val: any) => val[accessor] === true ? "✅" : '❌'
}

// @ts-ignore
const fetcher = (...args: any) => fetch(...args).then(res => res.json())

export default function ChannelList() {
    const convos = useSWR('/api/getConversations', fetcher)
    const { data, error } = convos
    console.log(data)
    if (convos.error) return <div>failed to load</div>

    const [showChanInfo, setShowChanInfo] = useState(false)
    const [visibleChannel, setVisibleChannel] = useState({})
    const [showSend, setShowSend] = useState(false)
    const [blockMsg, setBlockMsg] = useState('')
    const [textMsg, setTextMsg] = useState('')

    const handleClick = (id: string) => {
        setShowChanInfo(!showChanInfo)
        const chanData = convos.data[id]
        setVisibleChannel(chanData)
    }

    const handleCompose = (id: string) => {
        setShowSend(!showSend)
        const chanData = convos.data[id]
        setVisibleChannel(chanData)
    }

    const sendMessage = () => {
        if (blockMsg) {

        } else {
            if (visibleChannel !== undefined) {
                //@ts-ignore
                const res = Promise.resolve(axios.post(`/api/announce?chanId=${visibleChannel.id}&message=${textMsg}`))
                res.then((e) => {if (e.status === 200) {setShowSend(false)} })
            }
        }

        setShowSend(false)
    }

    const columns = useMemo(
        () => [
            {
                Header: 'Msg',
                accessor: (d: any) => (<span style={{cursor: 'pointer', fontSize: 20}} onClick={() => handleCompose(d.id)}>✍️</span>)
            },
            {
                Header: 'ID',
                accessor: (d: any) => (<span style={{cursor: 'pointer', textDecoration: 'underline'}} onClick={() => handleClick(d.id)}>{d['id']}</span>)
            },
            {
                Header: 'Name',
                accessor: 'name'
            },
            {
                Header: 'public?',
                accessor: booleanValue('is_channel')
            },
            {
                Header: 'archived?',
                accessor: booleanValue('is_archived')
            },
            {
                Header: 'created',
                accessor: 'created'
            },
            {
                Header: 'members',
                accessor: 'num_members'
            },
        ], []
    )

    const tableColumns = useMemo(
        () =>
          !data
            ? columns.map((column) => ({
                ...column,
                Cell: <Skeleton style={{minWidth: 80}} />,
              }))
            : columns,
        [data, columns]
      );
    const tableData = useMemo(() => data ? Object.keys(data).map(i => data[i]) : Array(30).fill({}), [data])

    const tableInstance = useTable({ columns: tableColumns, data: tableData }, useSortBy)

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
      } = tableInstance

  return (
    <div>
        <ReactModal 
            // @ts-ignore
            isOpen={showChanInfo}
            contentLabel={visibleChannel ? `${visibleChannel.name} - ${visibleChannel.id}` : ""}
            >
            <button onClick={() => setShowChanInfo(false)}>Close Modal</button>
                {visibleChannel && <ReactJson src={visibleChannel} />}
            <button onClick={() => setShowChanInfo(false)}>Close Modal</button>
        </ReactModal>

        <ReactModal 
            // @ts-ignore
            isOpen={showSend}
            contentLabel={visibleChannel ? `${visibleChannel.name} - ${visibleChannel.id}` : ""}
            >
            <p>You can use plain text for basic messages or blocks for fancy formatted ones. Careful with blocks, no error handling is done. Use https://app.slack.com/block-kit-builder. </p>
            <div style={{margin: "4px 0"}}>Plain text: 
                <input 
                    value={textMsg}
                    onChange={e => setTextMsg(e.target.value)}
                    type="text" />
            </div>
            <div  style={{margin: "4px 0"}}>
                <a target="_blank" rel="noreferrer" href="https://app.slack.com/block-kit-builder">Blocks</a>: 
                <textarea
                    value={blockMsg}
                    onChange={e => setBlockMsg(e.target.value)}
                />
            </div>
            <div  style={{margin: "4px 0"}}>
            <button onClick={() => setShowSend(false)}>Close</button>
            <button onClick={() => sendMessage()}>Send</button>
            </div>
        </ReactModal>

      <main>
      <table {...getTableProps()} style={{overflow: 'scroll'}}>

            <thead>
            {// Loop over the header rows

            headerGroups.map((headerGroup: any)=> (

                // Apply the header row props

                <tr {...headerGroup.getHeaderGroupProps()}>

                {// Loop over the headers in each row

                headerGroup.headers.map((column: any) => (

                    // Apply the header cell props

                    <th {...column.getHeaderProps(column.getSortByToggleProps())}>

                    {// Render the header

                    column.render('Header')}
                    <span>
                        {column.isSorted
                        ? column.isSortedDesc
                            ? ' 🔽'
                            : ' 🔼'
                        : <span style={{opacity: '.5'}}> 🔽</span>}
                    </span>
                    </th>

                ))}

                </tr>

            ))}

            </thead>

            {/* Apply the table body props */}

            <tbody {...getTableBodyProps()}>

            {// Loop over the table rows

            rows.map((row: any) => {

                // Prepare the row for display

                prepareRow(row)

                return (

                // Apply the row props

                <tr {...row.getRowProps()}>

                    {// Loop over the rows cells

                    row.cells.map((cell: any) => {

                    // Apply the cell props

                    return (

                        <td {...cell.getCellProps()}>

                        {// Render the cell contents

                        cell.render('Cell')}

                        </td>

                    )

                    })}

                </tr>

                )

            })}

            </tbody>

            </table>
      </main>
      <style jsx>{`
      table {
        border-spacing: 0;
        border: 1px solid black;
       }
        th,
        td {
            margin: 0;
            padding: 0.5rem;
            border-bottom: 1px solid black;
            border-right: 1px solid black;
        }
        td:last-child {
            border-right: 0;
        }
`}</style>
    </div>
  )
}