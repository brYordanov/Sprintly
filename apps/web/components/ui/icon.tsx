import Image from 'next/image'
import logo from '../../public/full-logo.png'
import symbol from '../../public/logo.png'

export function ProjectLogo({ width = 320, height = 120 }: { width?: number; height?: number }) {
    return (
        <Image src={logo} alt="Sprintly" placeholder="blur" width={width} height={height}></Image>
    )
}

export function ProjectSymbol({ width = 320, height = 120 }: { width?: number; height?: number }) {
    return (
        <Image src={symbol} alt="Sprintly" placeholder="blur" width={width} height={height}></Image>
    )
}
