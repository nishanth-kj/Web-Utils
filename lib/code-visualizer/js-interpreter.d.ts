// js-interpreter (https://github.com/NeilFraser/JS-Interpreter) has no published types —
// js-tracer.ts defines its own precise interfaces for the pieces it actually uses and
// casts through this `any` default export to get there.
declare module "js-interpreter" {
    const Interpreter: unknown;
    export default Interpreter;
}
