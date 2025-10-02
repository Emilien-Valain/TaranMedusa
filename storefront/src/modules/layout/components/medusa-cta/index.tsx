import { Text } from "@medusajs/ui"
import Button from "@/modules/common/components/button"
import { Github } from "@medusajs/icons"
import Image from "next/image"
import Medusa from "../../../common/icons/medusa"
import NextJs from "../../../common/icons/nextjs"

const MedusaCTA = () => {
  return (
    <Text className="flex gap-x-2 txt-compact-small-plus items-center">
      Powered by
      <a href="https://www.medusajs.com" target="_blank" rel="noreferrer">
        <Medusa fill="#9ca3af" className="fill-[#9ca3af]" />
      </a>
      &
      <a href="https://nextjs.org" target="_blank" rel="noreferrer">
        <NextJs fill="#9ca3af" />
      </a>
      &
      <a
        href="https://github.com/Emilien-Valain"
        target="_blank"
      >
        <Button variant="secondary" className="rounded-2xl">
          <Github />
          Emilien Valain
        </Button>
      </a>
    </Text>
  )
}

export default MedusaCTA
