import { Component, type ReactNode } from 'react'

type Props = { children: ReactNode; label: string }
type State = { failed: boolean }

/** Avoid losing the entire route if GPU/WebGL setup fails on an older device. */
export default class SceneErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error) {
    if (import.meta.env.DEV) console.error('3D scene unavailable:', error)
  }

  render() {
    if (this.state.failed) {
      return <div className="scene-fallback-art" role="img" aria-label={this.props.label}>
        <div className="scene-fallback-symbol">✳</div>
        <strong>{this.props.label}</strong>
        <span>Phiên bản tối giản dành cho thiết bị này</span>
      </div>
    }
    return this.props.children
  }
}
