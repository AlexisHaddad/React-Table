// This component is used whenever you don't want to pass down props to a react component
const DummyComponent = ({children}) => children;

DummyComponent.displayName = "DummyComponent";
DummyComponent.propTypes = {};

export default DummyComponent;
