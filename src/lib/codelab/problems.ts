/**
 * Campus OS — Practice Programming Problems
 * Curated problems with automated test cases and starter templates for students.
 */

import { PracticeProblem } from '@/types/codelab';

export const PRACTICE_PROBLEMS: PracticeProblem[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

Output the two 0-indexed positions separated by a space (e.g. \`0 1\`).`,
    inputFormat: `Line 1: An integer N (number of elements)\nLine 2: N space-separated integers\nLine 3: An integer target`,
    outputFormat: `Two space-separated integers representing the indices.`,
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9'],
    sampleInputs: ['4\n2 7 11 15\n9', '3\n3 2 4\n6'],
    sampleOutputs: ['0 1', '1 2'],
    testCases: [
      {
        input: '4\n2 7 11 15\n9',
        expectedOutput: '0 1',
        explanation: 'nums[0] + nums[1] == 9, so output 0 1',
      },
      {
        input: '3\n3 2 4\n6',
        expectedOutput: '1 2',
        explanation: 'nums[1] + nums[2] == 6, so output 1 2',
      },
      {
        input: '2\n3 3\n6',
        expectedOutput: '0 1',
        explanation: 'nums[0] + nums[1] == 6, so output 0 1',
      },
    ],
    starterTemplates: {
      python: `# Two Sum Solution
import sys

def two_sum(nums, target):
    # Write your solution here
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return f"{seen[diff]} {i}"
        seen[num] = i
    return ""

def main():
    lines = sys.stdin.read().split()
    if not lines:
        return
    n = int(lines[0])
    nums = [int(x) for x in lines[1:n+1]]
    target = int(lines[n+1])
    print(two_sum(nums, target))

if __name__ == "__main__":
    main()
`,
      cpp: `#include <iostream>
#include <vector>
#include <unordered_map>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    int target;
    cin >> target;

    unordered_map<int, int> seen;
    for (int i = 0; i < n; i++) {
        int diff = target - nums[i];
        if (seen.count(diff)) {
            cout << seen[diff] << " " << i << endl;
            return 0;
        }
        seen[nums[i]] = i;
    }
    return 0;
}
`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        int target = sc.nextInt();

        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < n; i++) {
            int diff = target - nums[i];
            if (seen.containsKey(diff)) {
                System.out.println(seen.get(diff) + " " + i);
                return;
            }
            seen.put(nums[i], i);
        }
    }
}
`,
    },
  },
  {
    id: 'second-largest',
    title: 'Find Second Largest Element',
    difficulty: 'Easy',
    category: 'Arrays & Math',
    description: `Given an array of integers, find the second largest distinct element in the array. If no second largest distinct element exists, output -1.`,
    inputFormat: `Line 1: An integer N\nLine 2: N space-separated integers`,
    outputFormat: `Single integer: the second largest distinct element or -1.`,
    constraints: ['1 <= N <= 10^5', '-10^9 <= A[i] <= 10^9'],
    sampleInputs: ['5\n12 35 1 10 34', '3\n10 10 10'],
    sampleOutputs: ['34', '-1'],
    testCases: [
      {
        input: '5\n12 35 1 10 34',
        expectedOutput: '34',
        explanation: 'The largest is 35, second largest is 34.',
      },
      {
        input: '3\n10 10 10',
        expectedOutput: '-1',
        explanation: 'All elements are identical; no second largest distinct exists.',
      },
      {
        input: '6\n5 1 8 2 8 7',
        expectedOutput: '7',
        explanation: 'Largest is 8, second largest distinct is 7.',
      },
    ],
    starterTemplates: {
      python: `# Find Second Largest Element
import sys

def second_largest(nums):
    unique = list(set(nums))
    if len(unique) < 2:
        return -1
    unique.sort(reverse=True)
    return unique[1]

def main():
    lines = sys.stdin.read().split()
    if not lines:
        return
    n = int(lines[0])
    nums = [int(x) for x in lines[1:n+1]]
    print(second_largest(nums))

if __name__ == "__main__":
    main()
`,
      cpp: `#include <iostream>
#include <vector>
#include <climits>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    if (n < 2) {
        cout << -1 << endl;
        return 0;
    }
    long long first = LLONG_MIN, second = LLONG_MIN;
    for (int i = 0; i < n; i++) {
        long long x;
        cin >> x;
        if (x > first) {
            second = first;
            first = x;
        } else if (x < first && x > second) {
            second = x;
        }
    }
    if (second == LLONG_MIN) cout << -1 << endl;
    else cout << second << endl;
    return 0;
}
`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        long first = Long.MIN_VALUE, second = Long.MIN_VALUE;
        for (int i = 0; i < n; i++) {
            long x = sc.nextLong();
            if (x > first) {
                second = first;
                first = x;
            } else if (x < first && x > second) {
                second = x;
            }
        }
        System.out.println(second == Long.MIN_VALUE ? -1 : second);
    }
}
`,
    },
  },
  {
    id: 'valid-palindrome',
    title: 'Valid Palindrome',
    difficulty: 'Easy',
    category: 'Strings',
    description: `A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.

Given a string \`s\`, print \`true\` if it is a palindrome, or \`false\` otherwise.`,
    inputFormat: `A single line containing the string.`,
    outputFormat: `true or false`,
    constraints: ['1 <= s.length <= 2 * 10^5'],
    sampleInputs: ['A man, a plan, a canal: Panama', 'race a car'],
    sampleOutputs: ['true', 'false'],
    testCases: [
      {
        input: 'A man, a plan, a canal: Panama',
        expectedOutput: 'true',
        explanation: '"amanaplanacanalpanama" is a palindrome.',
      },
      {
        input: 'race a car',
        expectedOutput: 'false',
        explanation: '"raceacar" is not a palindrome.',
      },
      {
        input: 'Was it a car or a cat I saw?',
        expectedOutput: 'true',
        explanation: '"wasitacaroracatisaw" is a palindrome.',
      },
    ],
    starterTemplates: {
      python: `# Valid Palindrome
import sys
import re

def is_palindrome(s: str) -> bool:
    cleaned = re.sub(r'[^a-zA-Z0-9]', '', s).lower()
    return cleaned == cleaned[::-1]

def main():
    s = sys.stdin.read().strip()
    print("true" if is_palindrome(s) else "false")

if __name__ == "__main__":
    main()
`,
      cpp: `#include <iostream>
#include <string>
#include <cctype>

using namespace std;

int main() {
    string line;
    getline(cin, line);
    string clean = "";
    for (char c : line) {
        if (isalnum(c)) clean += tolower(c);
    }
    int l = 0, r = (int)clean.size() - 1;
    bool ok = true;
    while (l < r) {
        if (clean[l++] != clean[r--]) {
            ok = false;
            break;
        }
    }
    cout << (ok ? "true" : "false") << endl;
    return 0;
}
`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String line = sc.nextLine();
        String clean = line.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
        int l = 0, r = clean.length() - 1;
        boolean ok = true;
        while (l < r) {
            if (clean.charAt(l++) != clean.charAt(r--)) {
                ok = false;
                break;
            }
        }
        System.out.println(ok ? "true" : "false");
    }
}
`,
    },
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    difficulty: 'Easy',
    category: 'Algorithms & Search',
    description: `Given a sorted ascending array of integers \`nums\` and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, output its 0-based index. Otherwise, output \`-1\`.

You must write an algorithm with \`O(log n)\` runtime complexity.`,
    inputFormat: `Line 1: An integer N\nLine 2: N sorted space-separated integers\nLine 3: An integer target`,
    outputFormat: `0-indexed position or -1`,
    constraints: ['1 <= N <= 10^5', 'nums is sorted in ascending order'],
    sampleInputs: ['6\n-1 0 3 5 9 12\n9', '6\n-1 0 3 5 9 12\n2'],
    sampleOutputs: ['4', '-1'],
    testCases: [
      {
        input: '6\n-1 0 3 5 9 12\n9',
        expectedOutput: '4',
        explanation: '9 exists in nums and its index is 4',
      },
      {
        input: '6\n-1 0 3 5 9 12\n2',
        expectedOutput: '-1',
        explanation: '2 does not exist in nums so output -1',
      },
    ],
    starterTemplates: {
      python: `# Binary Search Solution (O(log n))
import sys

def binary_search(nums, target):
    low = 0
    high = len(nums) - 1
    while low <= high:
        mid = (low + high) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

def main():
    lines = sys.stdin.read().split()
    if not lines:
        return
    n = int(lines[0])
    nums = [int(x) for x in lines[1:n+1]]
    target = int(lines[n+1])
    print(binary_search(nums, target))

if __name__ == "__main__":
    main()
`,
      cpp: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    int target;
    cin >> target;

    int low = 0, high = n - 1;
    int ans = -1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (nums[mid] == target) {
            ans = mid;
            break;
        } else if (nums[mid] < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    cout << ans << endl;
    return 0;
}
`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        int target = sc.nextInt();

        int low = 0, high = n - 1;
        int ans = -1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (nums[mid] == target) {
                ans = mid;
                break;
            } else if (nums[mid] < target) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        System.out.println(ans);
    }
}
`,
    },
  },
];
