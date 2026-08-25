/**
 * Campus OS — Code Templates for Supported Languages
 */

export const CODE_TEMPLATES: Record<string, string> = {
  python: `# Campus OS Code Lab — Python 3
# Write your solution below

def main():
    print("Hello from Campus OS Code Lab!")

if __name__ == "__main__":
    main()
`,

  cpp: `// Campus OS Code Lab — C++ (GCC 14)
#include <iostream>
#include <vector>
#include <string>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    cout << "Hello from Campus OS Code Lab!" << endl;

    return 0;
}
`,

  c: `/* Campus OS Code Lab — C (GCC 14) */
#include <stdio.h>
#include <stdlib.h>

int main() {
    printf("Hello from Campus OS Code Lab!\\n");
    return 0;
}
`,

  java: `// Campus OS Code Lab — Java (JDK 17)
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Campus OS Code Lab!");
    }
}
`,

  javascript: `// Campus OS Code Lab — JavaScript (Node.js 20)
// Use console.log for output and process.stdin for input

function solution() {
  console.log("Hello from Campus OS Code Lab!");
}

solution();
`,

  typescript: `// Campus OS Code Lab — TypeScript 5.6
interface StudentGreeting {
  message: string;
  timestamp: string;
}

function greet(msg: string): StudentGreeting {
  return {
    message: msg,
    timestamp: new Date().toISOString(),
  };
}

console.log(greet("Hello from Campus OS Code Lab!"));
`,

  go: `// Campus OS Code Lab — Go 1.23
package main

import "fmt"

func main() {
    fmt.Println("Hello from Campus OS Code Lab!")
}
`,

  rust: `// Campus OS Code Lab — Rust 1.85
fn main() {
    println!("Hello from Campus OS Code Lab!");
}
`,

  kotlin: `// Campus OS Code Lab — Kotlin 2.1
fun main() {
    println("Hello from Campus OS Code Lab!")
}
`,

  csharp: `// Campus OS Code Lab — C# (.NET / Mono)
using System;

public class Program {
    public static void Main() {
        Console.WriteLine("Hello from Campus OS Code Lab!");
    }
}
`,

  php: `<?php
// Campus OS Code Lab — PHP 8.3

echo "Hello from Campus OS Code Lab!\n";
?>
`,

  ruby: `# Campus OS Code Lab — Ruby 2.7

puts "Hello from Campus OS Code Lab!"
`,

  swift: `// Campus OS Code Lab — Swift 5.2
import Foundation

print("Hello from Campus OS Code Lab!")
`,

  bash: `#!/bin/bash
# Campus OS Code Lab — Bash Shell

echo "Hello from Campus OS Code Lab!"
`,
};
