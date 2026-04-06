import { STEPS_CONTENT } from './content.js';

export const MOD_OS = {
  id: 'os',
  title: 'Sistemas Operacionais',
  steps: [
    {
      short: '1. Processos & PCB',
      title: '🧬 Processos: Do fork() ao Zombie',
      content: STEPS_CONTENT[0],
      refs: [
        {text: 'task_struct no Linux', url: 'https://github.com/torvalds/linux/blob/master/include/linux/sched.h'},
        {text: 'fork(2) man page', url: 'https://man7.org/linux/man-pages/man2/fork.2.html'},
        {text: 'Process States (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Process_state'}
      ]
    },
    {
      short: '2. Scheduling (CFS)',
      title: '⏱️ CPU Scheduling: Do Round-Robin ao CFS',
      content: STEPS_CONTENT[1],
      refs: [
        {text: 'CFS Scheduler (Kernel Docs)', url: 'https://docs.kernel.org/scheduler/sched-design-CFS.html'},
        {text: 'Linux Scheduler (LWN)', url: 'https://lwn.net/Articles/230574/'},
        {text: 'sched(7) man page', url: 'https://man7.org/linux/man-pages/man7/sched.7.html'}
      ]
    },
    {
      short: '3. Threads & Concorrência',
      title: '🧵 Threads, Mutex e Deadlocks',
      content: STEPS_CONTENT[2],
      refs: [
        {text: 'pthreads(7) man page', url: 'https://man7.org/linux/man-pages/man7/pthreads.7.html'},
        {text: 'Deadlock (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Deadlock'},
        {text: 'Mutex vs Semaphore', url: 'https://en.wikipedia.org/wiki/Mutual_exclusion'}
      ]
    },
    {
      short: '4. Memória & Paginação',
      title: '🗃️ Gerenciamento de Memória: Stack, Heap e Paginação',
      content: STEPS_CONTENT[3],
      refs: [
        {text: 'proc(5) — /proc/[pid]/maps', url: 'https://man7.org/linux/man-pages/man5/proc.5.html'},
        {text: 'Linux Memory Management', url: 'https://www.kernel.org/doc/html/latest/admin-guide/mm/index.html'},
        {text: 'malloc internals (glibc)', url: 'https://sourceware.org/glibc/wiki/MallocInternals'}
      ]
    },
    {
      short: '5. Syscalls & I/O',
      title: '📡 System Calls: A Fronteira Kernel ↔ Userspace',
      content: STEPS_CONTENT[4],
      refs: [
        {text: 'syscall(2) man page', url: 'https://man7.org/linux/man-pages/man2/syscall.2.html'},
        {text: 'Linux syscall table', url: 'https://filippo.io/linux-syscall-table/'},
        {text: 'epoll(7) man page', url: 'https://man7.org/linux/man-pages/man7/epoll.7.html'},
        {text: 'io_uring (LWN)', url: 'https://lwn.net/Articles/776703/'}
      ]
    },
    {
      short: '6. File Systems',
      title: '💾 File Systems: Inodes, Journaling e ext4',
      content: STEPS_CONTENT[5],
      refs: [
        {text: 'ext4 (Kernel Docs)', url: 'https://www.kernel.org/doc/html/latest/filesystems/ext4/index.html'},
        {text: 'Inode (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Inode'},
        {text: 'VFS (Linux)', url: 'https://www.kernel.org/doc/html/latest/filesystems/vfs.html'}
      ]
    }
  ]
};
