import { respData, respErr } from '@/shared/lib/resp';
import {
  countProjectsByUserId,
  findProjectsByUserId,
} from '@/shared/models/project';
import { getUserInfo } from '@/shared/models/user';

export async function GET(request: Request) {
  try {
    const user = await getUserInfo();
    if (!user) {
      return respErr('no auth, please sign in');
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const pageSize = Math.max(
      parseInt(searchParams.get('pageSize') || '20', 10),
      1
    );
    const status = searchParams.get('status') || undefined;

    const [list, total] = await Promise.all([
      findProjectsByUserId(user.id, { page, pageSize, status }),
      countProjectsByUserId(user.id, { status }),
    ]);

    const response = respData({ list, total, page, pageSize });
    response.headers.set(
      'Cache-Control',
      'private, max-age=10, stale-while-revalidate=30'
    );
    return response;
  } catch (error: any) {
    console.log('list projects failed:', error);
    return respErr(error.message || 'list projects failed');
  }
}
