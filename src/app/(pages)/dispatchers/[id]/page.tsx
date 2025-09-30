import Btns from '@/components/ui/Btns'
import Tables from '@/components/ui/Tables'
import Taps from '@/components/ui/Taps'
import Titles from '@/components/ui/Titles'

const DispatcherDashboard = () => {
  return (
    <section className="mx-auto flex">
      <Taps role='dispatcher' />

      <div className="w-[clac(100% - 280px)] my-20 mx-10">
        <div className="flex items-center justify-between">
          <Titles>Dispatcher name</Titles>
          <Btns>Create Load</Btns>
        </div>
        <Tables style="table-auto my-20 w-full" />
      </div>
    </section>
  )
}

export default DispatcherDashboard