function main (json) {
    if(Object.prototype.toString.call(json) !== '[object String]') {console.error('param doesnt a string!!')}
    json = json.trim();

    let STATE_STACK = []; // state-stack
    let OBJECT_STACK = []; // object-stack
    let KEY_STACK = []; // key-value-stack
    let temp = '';
    let temp_number = '';
    let len = json.length;
    let pointer = 0;
    let now;
    let result = null;

    while(pointer < len) {
      let now = json[pointer];

      if (/(\s|\n)/.test(now)) {pointer++; continue;}
      if (/\d/.test(now)) {
        let state_test = getStackTop(STATE_STACK);
        if (state_test !== 'NUMBER_START' && state_test !== 'KEY_START') {
          STATE_STACK.push('NUMBER_START');
        }
      } else {
        if (getStackTop(STATE_STACK) === 'NUMBER_START') {
          STATE_STACK.push('NUMBER_END')
        }
      }

      switch(now) {
        case '{':
          STATE_STACK.push('START_OBJECT');
        break;

        case '"':
          if (getStackTop(STATE_STACK) !== 'KEY_START') {
            STATE_STACK.push('KEY_START');
          } else {
            STATE_STACK.push('KEY_END');
          }
        break;

        case '[':
          STATE_STACK.push('START_ARRAY');
        break;

        case ']':
          STATE_STACK.push('END_ARRAY');
        break;

        case ':':
            if (getStackTop(STATE_STACK) !== "KEY_START") {
                STATE_STACK.push('HOPE_EVAL');
            }
        break;

        case ',':
          STATE_STACK.push('PAUSE');
        break;

        case '}':
          STATE_STACK.push('END_OBJECT');
        break;
      }
      // console.log('state_stack:', STATE_STACK);
      // console.log('object_stack:', OBJECT_STACK);
      // console.log('key_stack:', KEY_STACK);
      // console.log('\n\n')
      switch(getStackTop(STATE_STACK)) {
        case 'KEY_START':
          if (now !== '\"') {
            temp += now;
          } else {
            temp = '';
          }
        break;

        case 'KEY_END':
          STATE_STACK.pop();
          STATE_STACK.pop();
          KEY_STACK.push(temp);
          if (getStackTop(STATE_STACK) === 'HOPE_EVAL') {
            let value = KEY_STACK.pop();
            let key = KEY_STACK.pop();
            let object = getStackTop(OBJECT_STACK);

            object[key] = value;
            STATE_STACK.pop();
          }

          if (getStackTop(STATE_STACK) === 'START_ARRAY') {
            let value = KEY_STACK.pop();
            let object = getStackTop(OBJECT_STACK);
            object.push(value);  
          }
        break;

        case 'NUMBER_START':
          temp_number += now;
        break;
        
        case 'PAUSE':
          STATE_STACK.pop();
          if (getStackTop(STATE_STACK) === 'NUMBER_END') {
            STATE_STACK.pop();
            STATE_STACK.pop();
            if (getStackTop(STATE_STACK) === 'HOPE_EVAL') {
              let value = temp_number;
              let key = KEY_STACK.pop();
              let object = getStackTop(OBJECT_STACK);

              object[key] = value;
              temp_number = '';
              STATE_STACK.pop();  
            } else if (getStackTop(STATE_STACK) === 'START_ARRAY') {
              let value = temp_number;
              let object = getStackTop(OBJECT_STACK);
              object.push(Number(value));
              temp_number = '';              
            }
          }
        break;

        case 'START_OBJECT':
          OBJECT_STACK.push({});
        break;

        case 'END_OBJECT':
          STATE_STACK.pop();
          if (getStackTop(STATE_STACK) === 'NUMBER_END') {
            STATE_STACK.pop();
            STATE_STACK.pop();

            if (getStackTop(STATE_STACK) === 'HOPE_EVAL') {
              STATE_STACK.pop();
              let value_object = getStackTop(OBJECT_STACK);
              let key = KEY_STACK.pop();

              value_object[key] = Number(temp_number);
              temp_number = '';
            }
          }

          if (OBJECT_STACK.length === 1) {
            result = OBJECT_STACK.pop();
            break;
          }

          if (getStackTop(STATE_STACK) === 'START_OBJECT') {
            if (getStackSecond(STATE_STACK) === 'HOPE_EVAL') {
              STATE_STACK.pop();
              let value = OBJECT_STACK.pop();
              let key = KEY_STACK.pop();
              let parent = getStackTop(OBJECT_STACK);

              parent[key] = value;
            }
          }
          STATE_STACK.pop();

          if(getStackTop(STATE_STACK) === 'START_ARRAY') {
            let object = OBJECT_STACK.pop();
            let parent = getStackTop(OBJECT_STACK);
            parent.push(object);
          }
        break;

        case 'START_ARRAY':
          OBJECT_STACK.push([]);  
        break;

        case 'END_ARRAY':
          STATE_STACK.pop();

          if (getStackTop(STATE_STACK) === 'NUMBER_END') {
            STATE_STACK.pop();
            STATE_STACK.pop();
            
            let value_object = getStackTop(OBJECT_STACK);

            value_object.push(Number(temp_number));
            temp_number = '';
          }

          if (getStackTop(STATE_STACK) === 'START_ARRAY') {
            STATE_STACK.pop();
          }

          if (getStackTop(STATE_STACK) === 'HOPE_EVAL') {
            STATE_STACK.pop();
            let value_object = OBJECT_STACK.pop();
            let key = KEY_STACK.pop();
            let parent = getStackTop(OBJECT_STACK);
          
            parent[key] = value_object;
          }

          if (OBJECT_STACK.length === 1) {
            result = OBJECT_STACK.pop();
            break;
          }
        break;  
      }

      pointer++;
    }

    function getStackTop(stack) {
      return stack[stack.length - 1];
    }

    function getStackSecond(stack) {
      return stack[stack.length - 2];
    }
    // console.log('state_stack:', STATE_STACK);
    // console.log('object_stack:', OBJECT_STACK);
    // console.log('key_stack:', KEY_STACK);
    return result;
}

module.exports = main;