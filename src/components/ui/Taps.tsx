// Types
type TTaps = {
  children : React.ReactNode
  style: string
}

const Taps = ({children ,style} : TTaps) => {
  return (
    <aside className={`${style} bg-gray-200 h-screen w-full`}>
      {children}
    </aside>
  )
}

export default Taps