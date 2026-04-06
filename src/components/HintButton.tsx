type Props = {
  onHint: () => void
}

function HintButton({ onHint }: Props){

  return (
    <button className="hint-btn" onClick={onHint}>
      💡 Hint
    </button>
  )

}

export default HintButton