function two(another: string) {
  return (hi: string, ho: string) => {
    console.log(arguments);
  }
}

two("blub")("hello", "good morning");