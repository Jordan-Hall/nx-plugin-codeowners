import { CodeownersExecutorSchema } from './schema';
import executor from './executor';

const options: CodeownersExecutorSchema = {
  coreReviewers:[],
  sources:[]
};

describe('Codeowners Executor', () => {
  it('can run', async () => {
    const output = await executor(options);
    expect(output.success).toBe(true);
  });
});
