interface DrawYouFooterAddressProps {
  nomeCompleto: string
  disciplina: string
  professor: string
  dataReferencia: string
}

export const DrawYouFooterAddress = ({
  nomeCompleto,
  disciplina,
  professor,
  dataReferencia,
}: DrawYouFooterAddressProps) => {
  return (
    <footer className="border-top bg-white text-center">
      <address className="container-fluid px-4 py-3 mb-0 text-secondary small">
        {nomeCompleto} | {dataReferencia} | {disciplina} - Prof. {professor}
      </address>
    </footer>
  )
}
