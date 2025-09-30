// Types
type TTable ={
  children : React.ReactNode
  style?: string
}

const Tables = ({children, style} : TTable) => {
  return (
    <table className={style}>
      {children}
    </table>
  )
}

export default Tables