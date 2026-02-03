import Image from 'next/image'
import logo from '../../public/logo.png'

export function ProjectLogo({ width = 320, height = 120 }: { width?: number; height?: number }) {
    return (
        <Image src={logo} alt="Sprintly" placeholder="blur" width={width} height={height}></Image>
    )
}
