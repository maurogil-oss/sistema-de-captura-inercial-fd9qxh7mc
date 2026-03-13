import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { mockFleetRanking } from '@/data/mockData'
import { Badge } from '@/components/ui/badge'

export function FleetRankingTable() {
  return (
    <div className="rounded-md border border-border/50 bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Driver Name</TableHead>
            <TableHead className="text-right">Distance (km)</TableHead>
            <TableHead className="text-right">Idling Time</TableHead>
            <TableHead className="text-right">Zen Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockFleetRanking.map((driver) => (
            <TableRow
              key={driver.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <TableCell className="font-mono text-xs text-muted-foreground">{driver.id}</TableCell>
              <TableCell className="font-medium">{driver.name}</TableCell>
              <TableCell className="text-right font-mono">{driver.distance}</TableCell>
              <TableCell className="text-right font-mono">{driver.idlingTime}</TableCell>
              <TableCell className="text-right">
                <Badge
                  variant={
                    driver.zenScore > 80
                      ? 'default'
                      : driver.zenScore > 60
                        ? 'secondary'
                        : 'destructive'
                  }
                  className="font-mono"
                >
                  {driver.zenScore}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
