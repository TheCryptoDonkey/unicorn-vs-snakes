const AXIS_THRESHOLD = 0.35;

type MappedKey = {
  key: string;
  code: string;
};

const LEFT = { key: "ArrowLeft", code: "ArrowLeft" };
const RIGHT = { key: "ArrowRight", code: "ArrowRight" };
const JUMP = { key: "ArrowUp", code: "ArrowUp" };
const FIRE = { key: " ", code: "Space" };
const PAUSE = { key: "Escape", code: "Escape" };

export class GamepadKeyboardBridge {
  private animationFrame = 0;
  private readonly activeCodes = new Set<string>();

  public start(): void {
    this.animationFrame = requestAnimationFrame(this.poll);
  }

  private readonly poll = (): void => {
    const gamepad = navigator.getGamepads?.().find((pad) => pad !== null);
    const horizontal = gamepad?.axes[0] ?? 0;

    this.updateKey(LEFT, !!gamepad && (horizontal < -AXIS_THRESHOLD || !!gamepad.buttons[14]?.pressed));
    this.updateKey(RIGHT, !!gamepad && (horizontal > AXIS_THRESHOLD || !!gamepad.buttons[15]?.pressed));
    this.updateKey(JUMP, !!gamepad && (!!gamepad.buttons[0]?.pressed || !!gamepad.buttons[12]?.pressed));
    this.updateKey(FIRE, !!gamepad && !!gamepad.buttons[2]?.pressed);
    this.updateKey(PAUSE, !!gamepad && !!gamepad.buttons[9]?.pressed);

    this.animationFrame = requestAnimationFrame(this.poll);
  };

  private updateKey(mappedKey: MappedKey, pressed: boolean): void {
    if (pressed === this.activeCodes.has(mappedKey.code)) return;

    if (pressed) {
      this.activeCodes.add(mappedKey.code);
    } else {
      this.activeCodes.delete(mappedKey.code);
    }

    window.dispatchEvent(new KeyboardEvent(pressed ? "keydown" : "keyup", {
      key: mappedKey.key,
      code: mappedKey.code,
      bubbles: true
    }));
  }
}
