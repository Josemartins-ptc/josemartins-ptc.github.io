// Generated from real Ariadne 0.2.0 output: `ariadne check --format json` on the samples,
// and a recorded Claude Code turn (the block message and the refactor are verbatim).
window.ARIADNE_DATA = {
 "samples": [
  {
   "key": "go",
   "name": "Go",
   "file": "cart.go",
   "tangled": {
    "code": "package shop\n\nfunc Total(items []Item, user User, coupon string) int {\n\ttotal := 0\n\tfor _, it := range items {\n\t\tif it.Qty > 0 {\n\t\t\tprice := it.Price\n\t\t\tif user.Member {\n\t\t\t\tif it.Category == \"books\" || it.Category == \"music\" {\n\t\t\t\t\tprice = price * 90 / 100\n\t\t\t\t} else if price > 100 {\n\t\t\t\t\tprice = price * 95 / 100\n\t\t\t\t}\n\t\t\t}\n\t\t\tfor i := 0; i < it.Qty; i++ {\n\t\t\t\tif coupon != \"\" && i == 0 {\n\t\t\t\t\tprice -= 5\n\t\t\t\t}\n\t\t\t\ttotal += price\n\t\t\t}\n\t\t}\n\t}\n\tif total > 1000 && user.Member {\n\t\ttotal -= 50\n\t}\n\treturn total\n}\n",
    "functions": [
     {
      "name": "Total",
      "span": {
       "start": 3,
       "end": 27
      },
      "cyclomatic": 12,
      "cognitive": 22,
      "length": 25,
      "parameters": 3,
      "nesting": 4,
      "increments": [
       {
        "line": 5,
        "construct": "loop",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 6,
        "construct": "if",
        "nesting": 1,
        "cognitive": 2,
        "cyclomatic": 1
       },
       {
        "line": 8,
        "construct": "if",
        "nesting": 2,
        "cognitive": 3,
        "cyclomatic": 1
       },
       {
        "line": 9,
        "construct": "if",
        "nesting": 3,
        "cognitive": 4,
        "cyclomatic": 1
       },
       {
        "line": 9,
        "construct": "|| sequence",
        "nesting": 3,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 11,
        "construct": "else if",
        "nesting": 3,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 15,
        "construct": "loop",
        "nesting": 2,
        "cognitive": 3,
        "cyclomatic": 1
       },
       {
        "line": 16,
        "construct": "if",
        "nesting": 3,
        "cognitive": 4,
        "cyclomatic": 1
       },
       {
        "line": 16,
        "construct": "&& sequence",
        "nesting": 3,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 23,
        "construct": "if",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 23,
        "construct": "&& sequence",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       }
      ],
      "limits": {
       "cyclomatic": 15,
       "cognitive": 15,
       "length": 80,
       "parameters": 7,
       "nesting": 4
      },
      "pass": false
     }
    ]
   },
   "refactored": {
    "code": "package shop\n\nfunc Total(items []Item, user User, coupon string) int {\n\ttotal := 0\n\tfor _, it := range items {\n\t\ttotal += lineTotal(it, user, coupon)\n\t}\n\tif total > 1000 && user.Member {\n\t\ttotal -= 50\n\t}\n\treturn total\n}\n\n// lineTotal returns the cost of all units of it. A coupon takes 5 off the\n// unit price, and the reduced price applies to every unit.\nfunc lineTotal(it Item, user User, coupon string) int {\n\tif it.Qty <= 0 {\n\t\treturn 0\n\t}\n\tprice := memberPrice(it, user)\n\tif coupon != \"\" {\n\t\tprice -= 5\n\t}\n\treturn price * it.Qty\n}\n\n// memberPrice returns the unit price after any member discount.\nfunc memberPrice(it Item, user User) int {\n\tif !user.Member {\n\t\treturn it.Price\n\t}\n\tif it.Category == \"books\" || it.Category == \"music\" {\n\t\treturn it.Price * 90 / 100\n\t}\n\tif it.Price > 100 {\n\t\treturn it.Price * 95 / 100\n\t}\n\treturn it.Price\n}\n",
    "functions": [
     {
      "name": "Total",
      "span": {
       "start": 3,
       "end": 12
      },
      "cyclomatic": 4,
      "cognitive": 3,
      "length": 10,
      "parameters": 3,
      "nesting": 1,
      "increments": [
       {
        "line": 5,
        "construct": "loop",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 8,
        "construct": "if",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 8,
        "construct": "&& sequence",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       }
      ],
      "limits": {
       "cyclomatic": 15,
       "cognitive": 15,
       "length": 80,
       "parameters": 7,
       "nesting": 4
      },
      "pass": true
     },
     {
      "name": "lineTotal",
      "span": {
       "start": 16,
       "end": 25
      },
      "cyclomatic": 3,
      "cognitive": 2,
      "length": 10,
      "parameters": 3,
      "nesting": 1,
      "increments": [
       {
        "line": 17,
        "construct": "if",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 21,
        "construct": "if",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       }
      ],
      "limits": {
       "cyclomatic": 15,
       "cognitive": 15,
       "length": 80,
       "parameters": 7,
       "nesting": 4
      },
      "pass": true
     },
     {
      "name": "memberPrice",
      "span": {
       "start": 28,
       "end": 39
      },
      "cyclomatic": 5,
      "cognitive": 4,
      "length": 12,
      "parameters": 2,
      "nesting": 1,
      "increments": [
       {
        "line": 29,
        "construct": "if",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 32,
        "construct": "if",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 32,
        "construct": "|| sequence",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 35,
        "construct": "if",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       }
      ],
      "limits": {
       "cyclomatic": 15,
       "cognitive": 15,
       "length": 80,
       "parameters": 7,
       "nesting": 4
      },
      "pass": true
     }
    ]
   }
  },
  {
   "key": "ts",
   "name": "TypeScript",
   "file": "sync.ts",
   "tangled": {
    "code": "export async function syncOrders(orders: Order[], api: Api, retries = 3): Promise<number> {\n  let synced = 0;\n  for (const order of orders) {\n    if (order.status === \"paid\" || order.status === \"shipped\") {\n      let attempt = 0;\n      while (attempt < retries) {\n        try {\n          const res = await api.push(order);\n          if (res.ok) {\n            synced++;\n            break;\n          } else if (res.status === 429) {\n            await sleep(res.retryAfter ?? 1000);\n          } else {\n            attempt++;\n          }\n        } catch (err) {\n          if (err instanceof NetworkError && attempt < retries - 1) {\n            attempt++;\n          } else {\n            throw err;\n          }\n        }\n      }\n    }\n  }\n  return synced;\n}\n",
    "functions": [
     {
      "name": "syncOrders",
      "span": {
       "start": 1,
       "end": 28
      },
      "cyclomatic": 11,
      "cognitive": 25,
      "length": 28,
      "parameters": 3,
      "nesting": 5,
      "increments": [
       {
        "line": 3,
        "construct": "loop",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 4,
        "construct": "if",
        "nesting": 1,
        "cognitive": 2,
        "cyclomatic": 1
       },
       {
        "line": 4,
        "construct": "|| sequence",
        "nesting": 1,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 6,
        "construct": "loop",
        "nesting": 2,
        "cognitive": 3,
        "cyclomatic": 1
       },
       {
        "line": 9,
        "construct": "if",
        "nesting": 3,
        "cognitive": 4,
        "cyclomatic": 1
       },
       {
        "line": 12,
        "construct": "else if",
        "nesting": 3,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 13,
        "construct": "?? sequence",
        "nesting": 4,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 14,
        "construct": "else",
        "nesting": 3,
        "cognitive": 1,
        "cyclomatic": 0
       },
       {
        "line": 17,
        "construct": "catch",
        "nesting": 3,
        "cognitive": 4,
        "cyclomatic": 1
       },
       {
        "line": 18,
        "construct": "if",
        "nesting": 4,
        "cognitive": 5,
        "cyclomatic": 1
       },
       {
        "line": 18,
        "construct": "&& sequence",
        "nesting": 4,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 20,
        "construct": "else",
        "nesting": 4,
        "cognitive": 1,
        "cyclomatic": 0
       }
      ],
      "limits": {
       "cyclomatic": 10,
       "cognitive": 15,
       "length": 80,
       "parameters": 7,
       "nesting": 4
      },
      "pass": false
     }
    ]
   },
   "refactored": {
    "code": "export async function syncOrders(orders: Order[], api: Api, retries = 3): Promise<number> {\n  let synced = 0;\n  for (const order of orders.filter(isSyncable)) {\n    if (await pushWithRetry(order, api, retries)) synced++;\n  }\n  return synced;\n}\n\nconst isSyncable = (order: Order) => order.status === \"paid\" || order.status === \"shipped\";\n\nasync function pushWithRetry(order: Order, api: Api, retries: number): Promise<boolean> {\n  for (let attempt = 0; attempt < retries; ) {\n    const outcome = await tryPush(order, api, attempt === retries - 1);\n    if (outcome === \"done\") return true;\n    if (outcome === \"retry\") attempt++;\n  }\n  return false;\n}\n\nasync function tryPush(order: Order, api: Api, last: boolean): Promise<\"done\" | \"retry\" | \"wait\"> {\n  try {\n    const res = await api.push(order);\n    if (res.ok) return \"done\";\n    if (res.status !== 429) return \"retry\";\n    await sleep(res.retryAfter ?? 1000);\n    return \"wait\";\n  } catch (err) {\n    if (err instanceof NetworkError && !last) return \"retry\";\n    throw err;\n  }\n}\n",
    "functions": [
     {
      "name": "syncOrders",
      "span": {
       "start": 1,
       "end": 7
      },
      "cyclomatic": 3,
      "cognitive": 3,
      "length": 7,
      "parameters": 3,
      "nesting": 2,
      "increments": [
       {
        "line": 3,
        "construct": "loop",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 4,
        "construct": "if",
        "nesting": 1,
        "cognitive": 2,
        "cyclomatic": 1
       }
      ],
      "limits": {
       "cyclomatic": 10,
       "cognitive": 15,
       "length": 80,
       "parameters": 7,
       "nesting": 4
      },
      "pass": true
     },
     {
      "name": "isSyncable",
      "span": {
       "start": 9,
       "end": 9
      },
      "cyclomatic": 2,
      "cognitive": 1,
      "length": 1,
      "parameters": 1,
      "nesting": 0,
      "increments": [
       {
        "line": 9,
        "construct": "|| sequence",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       }
      ],
      "limits": {
       "cyclomatic": 10,
       "cognitive": 15,
       "length": 80,
       "parameters": 7,
       "nesting": 4
      },
      "pass": true
     },
     {
      "name": "pushWithRetry",
      "span": {
       "start": 11,
       "end": 18
      },
      "cyclomatic": 4,
      "cognitive": 5,
      "length": 8,
      "parameters": 3,
      "nesting": 2,
      "increments": [
       {
        "line": 12,
        "construct": "loop",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 14,
        "construct": "if",
        "nesting": 1,
        "cognitive": 2,
        "cyclomatic": 1
       },
       {
        "line": 15,
        "construct": "if",
        "nesting": 1,
        "cognitive": 2,
        "cyclomatic": 1
       }
      ],
      "limits": {
       "cyclomatic": 10,
       "cognitive": 15,
       "length": 80,
       "parameters": 7,
       "nesting": 4
      },
      "pass": true
     },
     {
      "name": "tryPush",
      "span": {
       "start": 20,
       "end": 31
      },
      "cyclomatic": 7,
      "cognitive": 7,
      "length": 12,
      "parameters": 3,
      "nesting": 2,
      "increments": [
       {
        "line": 23,
        "construct": "if",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 24,
        "construct": "if",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 25,
        "construct": "?? sequence",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 27,
        "construct": "catch",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 28,
        "construct": "if",
        "nesting": 1,
        "cognitive": 2,
        "cyclomatic": 1
       },
       {
        "line": 28,
        "construct": "&& sequence",
        "nesting": 1,
        "cognitive": 1,
        "cyclomatic": 1
       }
      ],
      "limits": {
       "cyclomatic": 10,
       "cognitive": 15,
       "length": 80,
       "parameters": 7,
       "nesting": 4
      },
      "pass": true
     }
    ]
   }
  },
  {
   "key": "js",
   "name": "JavaScript",
   "file": "form.js",
   "tangled": {
    "code": "export function validate(form, rules) {\n  const errors = {};\n  for (const field of Object.keys(rules)) {\n    const value = form[field];\n    const rule = rules[field];\n    if (rule.required && (value === undefined || value === \"\")) {\n      errors[field] = \"required\";\n    } else if (value !== undefined) {\n      if (rule.min && value.length < rule.min) {\n        errors[field] = \"too short\";\n      } else if (rule.max && value.length > rule.max) {\n        errors[field] = \"too long\";\n      } else if (rule.pattern) {\n        if (!rule.pattern.test(value)) {\n          errors[field] = rule.message || \"invalid\";\n        }\n      }\n    }\n  }\n  return Object.keys(errors).length ? errors : null;\n}\n",
    "functions": [
     {
      "name": "validate",
      "span": {
       "start": 1,
       "end": 21
      },
      "cyclomatic": 14,
      "cognitive": 19,
      "length": 21,
      "parameters": 2,
      "nesting": 4,
      "increments": [
       {
        "line": 3,
        "construct": "loop",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 6,
        "construct": "if",
        "nesting": 1,
        "cognitive": 2,
        "cyclomatic": 1
       },
       {
        "line": 6,
        "construct": "&& || sequence",
        "nesting": 1,
        "cognitive": 2,
        "cyclomatic": 2
       },
       {
        "line": 8,
        "construct": "else if",
        "nesting": 1,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 9,
        "construct": "if",
        "nesting": 2,
        "cognitive": 3,
        "cyclomatic": 1
       },
       {
        "line": 9,
        "construct": "&& sequence",
        "nesting": 2,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 11,
        "construct": "else if",
        "nesting": 2,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 11,
        "construct": "&& sequence",
        "nesting": 2,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 13,
        "construct": "else if",
        "nesting": 2,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 14,
        "construct": "if",
        "nesting": 3,
        "cognitive": 4,
        "cyclomatic": 1
       },
       {
        "line": 15,
        "construct": "|| sequence",
        "nesting": 4,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 20,
        "construct": "conditional",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       }
      ],
      "limits": {
       "cyclomatic": 10,
       "cognitive": 15,
       "length": 80,
       "parameters": 7,
       "nesting": 4
      },
      "pass": false
     }
    ]
   },
   "refactored": {
    "code": "export function validate(form, rules) {\n  const errors = {};\n  for (const [field, rule] of Object.entries(rules)) {\n    const error = checkField(form[field], rule);\n    if (error) errors[field] = error;\n  }\n  return Object.keys(errors).length ? errors : null;\n}\n\nfunction checkField(value, rule) {\n  const missing = value === undefined || value === \"\";\n  if (rule.required && missing) return \"required\";\n  if (value === undefined) return null;\n  return lengthError(value, rule) ?? patternError(value, rule);\n}\n\nconst lengthError = (value, rule) =>\n  (rule.min && value.length < rule.min && \"too short\") ||\n  (rule.max && value.length > rule.max && \"too long\") ||\n  null;\n\nconst patternError = (value, rule) =>\n  rule.pattern && !rule.pattern.test(value) ? rule.message || \"invalid\" : null;\n",
    "functions": [
     {
      "name": "validate",
      "span": {
       "start": 1,
       "end": 8
      },
      "cyclomatic": 4,
      "cognitive": 4,
      "length": 8,
      "parameters": 2,
      "nesting": 2,
      "increments": [
       {
        "line": 3,
        "construct": "loop",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 5,
        "construct": "if",
        "nesting": 1,
        "cognitive": 2,
        "cyclomatic": 1
       },
       {
        "line": 7,
        "construct": "conditional",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       }
      ],
      "limits": {
       "cyclomatic": 10,
       "cognitive": 15,
       "length": 80,
       "parameters": 7,
       "nesting": 4
      },
      "pass": true
     },
     {
      "name": "checkField",
      "span": {
       "start": 10,
       "end": 15
      },
      "cyclomatic": 6,
      "cognitive": 5,
      "length": 6,
      "parameters": 2,
      "nesting": 1,
      "increments": [
       {
        "line": 11,
        "construct": "|| sequence",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 12,
        "construct": "if",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 12,
        "construct": "&& sequence",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 13,
        "construct": "if",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 14,
        "construct": "?? sequence",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       }
      ],
      "limits": {
       "cyclomatic": 10,
       "cognitive": 15,
       "length": 80,
       "parameters": 7,
       "nesting": 4
      },
      "pass": true
     },
     {
      "name": "lengthError",
      "span": {
       "start": 17,
       "end": 20
      },
      "cyclomatic": 7,
      "cognitive": 4,
      "length": 4,
      "parameters": 2,
      "nesting": 0,
      "increments": [
       {
        "line": 18,
        "construct": "&& || && || sequence",
        "nesting": 0,
        "cognitive": 4,
        "cyclomatic": 6
       }
      ],
      "limits": {
       "cyclomatic": 10,
       "cognitive": 15,
       "length": 80,
       "parameters": 7,
       "nesting": 4
      },
      "pass": true
     },
     {
      "name": "patternError",
      "span": {
       "start": 22,
       "end": 23
      },
      "cyclomatic": 4,
      "cognitive": 3,
      "length": 2,
      "parameters": 2,
      "nesting": 1,
      "increments": [
       {
        "line": 23,
        "construct": "conditional",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 23,
        "construct": "&& sequence",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 23,
        "construct": "|| sequence",
        "nesting": 1,
        "cognitive": 1,
        "cyclomatic": 1
       }
      ],
      "limits": {
       "cyclomatic": 10,
       "cognitive": 15,
       "length": 80,
       "parameters": 7,
       "nesting": 4
      },
      "pass": true
     }
    ]
   }
  },
  {
   "key": "rust",
   "name": "Rust",
   "file": "parse.rs",
   "tangled": {
    "code": "pub fn parse_config(lines: &[&str]) -> Result<Config, String> {\n    let mut config = Config::default();\n    for (n, line) in lines.iter().enumerate() {\n        let line = line.trim();\n        if line.is_empty() || line.starts_with('#') {\n            continue;\n        }\n        if let Some((key, value)) = line.split_once('=') {\n            match key.trim() {\n                \"port\" => {\n                    if let Ok(port) = value.trim().parse() {\n                        config.port = port;\n                    } else {\n                        return Err(format!(\"line {}: bad port\", n + 1));\n                    }\n                }\n                \"host\" => {\n                    if value.trim().is_empty() {\n                        return Err(format!(\"line {}: empty host\", n + 1));\n                    }\n                    config.host = value.trim().to_string();\n                }\n                \"debug\" => config.debug = value.trim() == \"true\",\n                other => return Err(format!(\"line {}: unknown key {other}\", n + 1)),\n            }\n        } else {\n            return Err(format!(\"line {}: expected key = value\", n + 1));\n        }\n    }\n    Ok(config)\n}\n",
    "functions": [
     {
      "name": "parse_config",
      "span": {
       "start": 1,
       "end": 31
      },
      "cyclomatic": 11,
      "cognitive": 19,
      "length": 31,
      "parameters": 1,
      "nesting": 4,
      "increments": [
       {
        "line": 3,
        "construct": "loop",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 5,
        "construct": "if",
        "nesting": 1,
        "cognitive": 2,
        "cyclomatic": 1
       },
       {
        "line": 5,
        "construct": "|| sequence",
        "nesting": 1,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 8,
        "construct": "if",
        "nesting": 1,
        "cognitive": 2,
        "cyclomatic": 1
       },
       {
        "line": 9,
        "construct": "switch",
        "nesting": 2,
        "cognitive": 3,
        "cyclomatic": 0
       },
       {
        "line": 10,
        "construct": "case",
        "nesting": 3,
        "cognitive": 0,
        "cyclomatic": 1
       },
       {
        "line": 11,
        "construct": "if",
        "nesting": 3,
        "cognitive": 4,
        "cyclomatic": 1
       },
       {
        "line": 13,
        "construct": "else",
        "nesting": 3,
        "cognitive": 1,
        "cyclomatic": 0
       },
       {
        "line": 17,
        "construct": "case",
        "nesting": 3,
        "cognitive": 0,
        "cyclomatic": 1
       },
       {
        "line": 18,
        "construct": "if",
        "nesting": 3,
        "cognitive": 4,
        "cyclomatic": 1
       },
       {
        "line": 23,
        "construct": "case",
        "nesting": 3,
        "cognitive": 0,
        "cyclomatic": 1
       },
       {
        "line": 24,
        "construct": "case",
        "nesting": 3,
        "cognitive": 0,
        "cyclomatic": 1
       },
       {
        "line": 26,
        "construct": "else",
        "nesting": 1,
        "cognitive": 1,
        "cyclomatic": 0
       }
      ],
      "limits": {
       "cyclomatic": 10,
       "cognitive": 15,
       "length": 80,
       "parameters": 7,
       "nesting": 4
      },
      "pass": false
     }
    ]
   },
   "refactored": {
    "code": "pub fn parse_config(lines: &[&str]) -> Result<Config, String> {\n    let mut config = Config::default();\n    for (n, line) in lines.iter().enumerate() {\n        apply_line(&mut config, line.trim())\n            .map_err(|error| format!(\"line {}: {error}\", n + 1))?;\n    }\n    Ok(config)\n}\n\nfn apply_line(config: &mut Config, line: &str) -> Result<(), String> {\n    if line.is_empty() || line.starts_with('#') {\n        return Ok(());\n    }\n    let (key, value) = line.split_once('=').ok_or(\"expected key = value\")?;\n    apply_setting(config, key.trim(), value.trim())\n}\n\nfn apply_setting(config: &mut Config, key: &str, value: &str) -> Result<(), String> {\n    match key {\n        \"port\" => config.port = value.parse().map_err(|_| \"bad port\")?,\n        \"host\" if value.is_empty() => return Err(\"empty host\".to_string()),\n        \"host\" => config.host = value.to_string(),\n        \"debug\" => config.debug = value == \"true\",\n        other => return Err(format!(\"unknown key {other}\")),\n    }\n    Ok(())\n}\n",
    "functions": [
     {
      "name": "parse_config",
      "span": {
       "start": 1,
       "end": 8
      },
      "cyclomatic": 2,
      "cognitive": 1,
      "length": 8,
      "parameters": 1,
      "nesting": 1,
      "increments": [
       {
        "line": 3,
        "construct": "loop",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       }
      ],
      "limits": {
       "cyclomatic": 10,
       "cognitive": 15,
       "length": 80,
       "parameters": 7,
       "nesting": 4
      },
      "pass": true
     },
     {
      "name": "apply_line",
      "span": {
       "start": 10,
       "end": 16
      },
      "cyclomatic": 3,
      "cognitive": 2,
      "length": 7,
      "parameters": 2,
      "nesting": 1,
      "increments": [
       {
        "line": 11,
        "construct": "if",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 11,
        "construct": "|| sequence",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       }
      ],
      "limits": {
       "cyclomatic": 10,
       "cognitive": 15,
       "length": 80,
       "parameters": 7,
       "nesting": 4
      },
      "pass": true
     },
     {
      "name": "apply_setting",
      "span": {
       "start": 18,
       "end": 27
      },
      "cyclomatic": 7,
      "cognitive": 1,
      "length": 10,
      "parameters": 3,
      "nesting": 1,
      "increments": [
       {
        "line": 19,
        "construct": "switch",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 0
       },
       {
        "line": 20,
        "construct": "case",
        "nesting": 1,
        "cognitive": 0,
        "cyclomatic": 1
       },
       {
        "line": 21,
        "construct": "case",
        "nesting": 1,
        "cognitive": 0,
        "cyclomatic": 1
       },
       {
        "line": 21,
        "construct": "guard",
        "nesting": 1,
        "cognitive": 0,
        "cyclomatic": 1
       },
       {
        "line": 22,
        "construct": "case",
        "nesting": 1,
        "cognitive": 0,
        "cyclomatic": 1
       },
       {
        "line": 23,
        "construct": "case",
        "nesting": 1,
        "cognitive": 0,
        "cyclomatic": 1
       },
       {
        "line": 24,
        "construct": "case",
        "nesting": 1,
        "cognitive": 0,
        "cyclomatic": 1
       }
      ],
      "limits": {
       "cyclomatic": 10,
       "cognitive": 15,
       "length": 80,
       "parameters": 7,
       "nesting": 4
      },
      "pass": true
     }
    ]
   }
  },
  {
   "key": "java",
   "name": "Java",
   "file": "Shipping.java",
   "tangled": {
    "code": "public class Shipping {\n    public static int cost(Order order) {\n        int cost = 0;\n        if (order.items().isEmpty()) {\n            return 0;\n        }\n        for (Item item : order.items()) {\n            if (item.digital()) {\n                continue;\n            }\n            if (item.weightGrams() > 20000) {\n                cost += 2500;\n            } else if (item.weightGrams() > 5000) {\n                cost += 1200;\n            } else {\n                cost += 500;\n            }\n            if (item.fragile() && !order.express()) {\n                cost += 300;\n            }\n        }\n        if (order.express()) {\n            cost = cost * 2;\n        }\n        if (order.member() && cost > 0) {\n            if (order.total() >= 5000 || order.country().equals(\"PT\")) {\n                cost = 0;\n            } else {\n                cost = cost - cost / 10;\n            }\n        }\n        return cost;\n    }\n}\n",
    "functions": [
     {
      "name": "Shipping.cost",
      "span": {
       "start": 2,
       "end": 33
      },
      "cyclomatic": 13,
      "cognitive": 18,
      "length": 32,
      "parameters": 1,
      "nesting": 2,
      "increments": [
       {
        "line": 4,
        "construct": "if",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 7,
        "construct": "loop",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 8,
        "construct": "if",
        "nesting": 1,
        "cognitive": 2,
        "cyclomatic": 1
       },
       {
        "line": 11,
        "construct": "if",
        "nesting": 1,
        "cognitive": 2,
        "cyclomatic": 1
       },
       {
        "line": 13,
        "construct": "else if",
        "nesting": 1,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 15,
        "construct": "else",
        "nesting": 1,
        "cognitive": 1,
        "cyclomatic": 0
       },
       {
        "line": 18,
        "construct": "if",
        "nesting": 1,
        "cognitive": 2,
        "cyclomatic": 1
       },
       {
        "line": 18,
        "construct": "&& sequence",
        "nesting": 1,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 22,
        "construct": "if",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 25,
        "construct": "if",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 25,
        "construct": "&& sequence",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 26,
        "construct": "if",
        "nesting": 1,
        "cognitive": 2,
        "cyclomatic": 1
       },
       {
        "line": 26,
        "construct": "|| sequence",
        "nesting": 1,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 28,
        "construct": "else",
        "nesting": 1,
        "cognitive": 1,
        "cyclomatic": 0
       }
      ],
      "limits": {
       "cyclomatic": 10,
       "cognitive": 15,
       "length": 80,
       "parameters": 7,
       "nesting": 4
      },
      "pass": false
     }
    ]
   },
   "refactored": {
    "code": "public class Shipping {\n    public static int cost(Order order) {\n        int cost = 0;\n        for (Item item : order.items()) {\n            cost += itemCost(item, order.express());\n        }\n        if (order.express()) {\n            cost = cost * 2;\n        }\n        return memberPrice(order, cost);\n    }\n\n    private static int itemCost(Item item, boolean express) {\n        if (item.digital()) {\n            return 0;\n        }\n        int fragileFee = item.fragile() && !express ? 300 : 0;\n        return weightCost(item.weightGrams()) + fragileFee;\n    }\n\n    private static int weightCost(int grams) {\n        if (grams > 20000) {\n            return 2500;\n        }\n        return grams > 5000 ? 1200 : 500;\n    }\n\n    private static int memberPrice(Order order, int cost) {\n        if (!order.member() || cost == 0) {\n            return cost;\n        }\n        boolean free = order.total() >= 5000 || order.country().equals(\"PT\");\n        return free ? 0 : cost - cost / 10;\n    }\n}\n",
    "functions": [
     {
      "name": "Shipping.cost",
      "span": {
       "start": 2,
       "end": 11
      },
      "cyclomatic": 3,
      "cognitive": 2,
      "length": 10,
      "parameters": 1,
      "nesting": 1,
      "increments": [
       {
        "line": 4,
        "construct": "loop",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 7,
        "construct": "if",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       }
      ],
      "limits": {
       "cyclomatic": 10,
       "cognitive": 15,
       "length": 80,
       "parameters": 7,
       "nesting": 4
      },
      "pass": true
     },
     {
      "name": "Shipping.itemCost",
      "span": {
       "start": 13,
       "end": 19
      },
      "cyclomatic": 4,
      "cognitive": 3,
      "length": 7,
      "parameters": 2,
      "nesting": 1,
      "increments": [
       {
        "line": 14,
        "construct": "if",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 17,
        "construct": "conditional",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 17,
        "construct": "&& sequence",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       }
      ],
      "limits": {
       "cyclomatic": 10,
       "cognitive": 15,
       "length": 80,
       "parameters": 7,
       "nesting": 4
      },
      "pass": true
     },
     {
      "name": "Shipping.weightCost",
      "span": {
       "start": 21,
       "end": 26
      },
      "cyclomatic": 3,
      "cognitive": 2,
      "length": 6,
      "parameters": 1,
      "nesting": 1,
      "increments": [
       {
        "line": 22,
        "construct": "if",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 25,
        "construct": "conditional",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       }
      ],
      "limits": {
       "cyclomatic": 10,
       "cognitive": 15,
       "length": 80,
       "parameters": 7,
       "nesting": 4
      },
      "pass": true
     },
     {
      "name": "Shipping.memberPrice",
      "span": {
       "start": 28,
       "end": 34
      },
      "cyclomatic": 5,
      "cognitive": 4,
      "length": 7,
      "parameters": 2,
      "nesting": 1,
      "increments": [
       {
        "line": 29,
        "construct": "if",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 29,
        "construct": "|| sequence",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 32,
        "construct": "|| sequence",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       },
       {
        "line": 33,
        "construct": "conditional",
        "nesting": 0,
        "cognitive": 1,
        "cyclomatic": 1
       }
      ],
      "limits": {
       "cyclomatic": 10,
       "cognitive": 15,
       "length": 80,
       "parameters": 7,
       "nesting": 4
      },
      "pass": true
     }
    ]
   }
  }
 ],
 "turn": {
  "quote": "Your Ariadne hook rejected the original because its cognitive complexity was 22 and the limit is 15.",
  "tangled": "package shop\n\nfunc Total(items []Item, user User, coupon string) int {\n\ttotal := 0\n\tfor _, it := range items {\n\t\tif it.Qty > 0 {\n\t\t\tprice := it.Price\n\t\t\tif user.Member {\n\t\t\t\tif it.Category == \"books\" || it.Category == \"music\" {\n\t\t\t\t\tprice = price * 90 / 100\n\t\t\t\t} else if price > 100 {\n\t\t\t\t\tprice = price * 95 / 100\n\t\t\t\t}\n\t\t\t}\n\t\t\tfor i := 0; i < it.Qty; i++ {\n\t\t\t\tif coupon != \"\" && i == 0 {\n\t\t\t\t\tprice -= 5\n\t\t\t\t}\n\t\t\t\ttotal += price\n\t\t\t}\n\t\t}\n\t}\n\tif total > 1000 && user.Member {\n\t\ttotal -= 50\n\t}\n\treturn total\n}\n",
  "block": "Ariadne: 1 function above complexity limits in cart.go\n\n  Total (lines 3-27)\n    cognitive  22 > 15    cyclomatic 12 <= 15\n    top contributors (cognitive):\n      L9    if (nesting 3)            +4\n      L16   if (nesting 3)            +4\n      L8    if (nesting 2)            +3\n\nRefactor these functions to meet the limits without changing behavior.\nPrefer guard clauses, early returns, and extracting named helpers that each\ndo one thing. Run `ariadne explain cart.go:Total` to see every increment.",
  "refactored": "package shop\n\nfunc Total(items []Item, user User, coupon string) int {\n\ttotal := 0\n\tfor _, it := range items {\n\t\ttotal += lineTotal(it, user, coupon)\n\t}\n\tif total > 1000 && user.Member {\n\t\ttotal -= 50\n\t}\n\treturn total\n}\n\n// lineTotal returns the cost of all units of it. A coupon takes 5 off the\n// unit price, and the reduced price applies to every unit.\nfunc lineTotal(it Item, user User, coupon string) int {\n\tif it.Qty <= 0 {\n\t\treturn 0\n\t}\n\tprice := memberPrice(it, user)\n\tif coupon != \"\" {\n\t\tprice -= 5\n\t}\n\treturn price * it.Qty\n}\n\n// memberPrice returns the unit price after any member discount.\nfunc memberPrice(it Item, user User) int {\n\tif !user.Member {\n\t\treturn it.Price\n\t}\n\tif it.Category == \"books\" || it.Category == \"music\" {\n\t\treturn it.Price * 90 / 100\n\t}\n\tif it.Price > 100 {\n\t\treturn it.Price * 95 / 100\n\t}\n\treturn it.Price\n}\n",
  "status": "Ariadne ✓ lint passed · 3 functions within limits · tests passed"
 }
};
